import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const buildSystemPrompt = (userContext?: {
  location?: string;
  home_size?: string;
  budget_range?: string;
  energy_goals?: string[];
  current_setup?: string;
  household_size?: number;
  property_type?: string;
  grid_reliability?: string;
  additional_notes?: string;
}) => {
  let contextSection = "";
  
  if (userContext && Object.values(userContext).some(v => v !== null && v !== undefined)) {
    contextSection = `\n\nUSER CONTEXT (Use this to personalize your responses):`;
    if (userContext.location) contextSection += `\n- Location: ${userContext.location}`;
    if (userContext.property_type) contextSection += `\n- Property Type: ${userContext.property_type}`;
    if (userContext.home_size) contextSection += `\n- Home Size: ${userContext.home_size}`;
    if (userContext.household_size) contextSection += `\n- Household Size: ${userContext.household_size} people`;
    if (userContext.budget_range) contextSection += `\n- Budget Range: ${userContext.budget_range}`;
    if (userContext.current_setup) contextSection += `\n- Current Energy Setup: ${userContext.current_setup}`;
    if (userContext.grid_reliability) contextSection += `\n- Grid Reliability: ${userContext.grid_reliability}`;
    if (userContext.energy_goals?.length) contextSection += `\n- Energy Goals: ${userContext.energy_goals.join(", ")}`;
    if (userContext.additional_notes) contextSection += `\n- Additional Notes: ${userContext.additional_notes}`;
    contextSection += `\n\nALWAYS reference this context when giving recommendations. Tailor suggestions to their specific situation, budget, and goals.`;
  }

  return `You are Embraix AI - a friendly clean energy expert. 🌱⚡
${contextSection}

CRITICAL RULES:
1. Be CONCISE. Max 3-4 short paragraphs per response. No walls of text.
2. Lead with the direct answer in 1-2 sentences.
3. Use bullet points (max 4-5) instead of long paragraphs.
4. Only add detail if the user asks for more.
5. Be warm and conversational, use 1-2 emojis max.

FORMATTING:
- Short paragraphs (2-3 sentences max)
- Bullet points for lists
- Bold **key terms** for scannability
- End with a brief follow-up question when relevant

EXPERTISE: Solar, inverters, batteries, EVs, charging, smart home, energy efficiency — focused on African markets.

EXPERT REFERRAL (use for site assessments, installations, quotes, legal):
Say: "This needs our expert team! Say 'connect me to an expert' and I'll arrange it. 👨‍🔧"

If confirmed: "[EXPERT_REFERRAL] Connecting you now! Describe what you need and a specialist will reach out. 🤝"

EXAMPLE:
User: "What size solar system for my home?"

"For a typical Nigerian home (lights, fans, TV, charging), a **3-5kW system** works well. 🌞

Key factors:
- **3kW** — handles basics for 5-8 hours
- **5kW** — can run a small AC unit
- **Battery** — get enough for nighttime + cloudy days

Check your monthly kWh usage to size it right. Want me to break down costs?"`;

};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const token = authHeader.replace("Bearer ", "");
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // Verify the JWT by getting the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("JWT verification failed:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service is not properly configured");
    }

    // Fetch user preferences using service role for reliable access
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    const { data: userPrefs } = await supabaseAdmin
      .from("user_ai_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    console.log("Processing chat request with", messages.length, "messages for user:", user.id, "has preferences:", !!userPrefs);

    const systemPrompt = buildSystemPrompt(userPrefs || undefined);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service credits exhausted. Please contact support." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming response from AI gateway for user:", user.id);
    
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
