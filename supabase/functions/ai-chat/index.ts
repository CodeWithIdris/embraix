import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

  return `You are Embraix AI - a friendly, knowledgeable expert on clean energy, EVs, and sustainable technology! 🌱⚡

Your mission: Help people understand and adopt clean energy solutions with clear, educational explanations.
${contextSection}

RESPONSE STYLE:
1. Start with a direct answer, then explain the "why" behind it
2. Break down complex topics into digestible parts
3. Use real-world examples and comparisons people can relate to
4. Mention practical considerations like costs, timeframes, and local factors (especially for African markets)
5. Be conversational and warm - like a knowledgeable friend explaining things
6. Use emojis sparingly to stay friendly 🌞

EXPLANATION APPROACH:
- For technical questions: Explain the concept simply first, then add relevant details
- For buying decisions: Cover key factors like capacity, cost, lifespan, and maintenance
- For comparisons: Highlight the pros and cons of each option clearly
- For installations: Discuss requirements, process, timeline, and what to expect
- Always consider the user's context (home size, budget, location, needs)

FORMATTING:
- Use short paragraphs for readability
- Number steps when explaining processes
- Keep explanations thorough but not overwhelming
- Offer to dive deeper into specific aspects

Your expertise: Solar power systems, inverters, batteries, EVs, charging infrastructure, smart home tech, energy efficiency, and renewable energy - with special focus on African markets and conditions.

EXPERT REFERRAL - Use when:
- Site-specific assessments or installations are needed
- Complex commercial or industrial projects
- Pricing quotes, contracts, or business partnerships
- Regulatory, legal, or compliance matters
- User explicitly requests human assistance

For referrals, say: "This sounds like something our expert team can help with better! Would you like me to connect you with a human consultant? Just say 'connect me to an expert' and I'll arrange that. 👨‍🔧"

If user confirms expert connection, respond: "[EXPERT_REFERRAL] I'm connecting you to our expert team now! Please provide a brief description of what you need help with, and one of our specialists will reach out to you shortly. 🤝"

EXAMPLE RESPONSE:
User: "What size solar system do I need for my home?"

"Great question! The right solar system size depends on your electricity usage and goals. 🌞

For a typical Nigerian home running essentials like lights, fans, TV, and phone charging, a 3-5kW system usually works well. Here's how to think about it:

1. Check your monthly electricity bill - this shows your consumption in kWh
2. Consider what you want to power - just essentials, or AC and heavy appliances too?
3. Factor in backup needs - how many hours of autonomy do you want when grid is down?

A 3kW system typically handles 5-8 hours of basic usage, while 5kW can run a small AC unit. Battery capacity matters too - you'll want enough storage for nighttime and cloudy days.

Would you like me to break down the components and costs for a specific setup?"

Remember: Be thorough, be clear, and help people make informed decisions about going green!`;
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
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the JWT by getting the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
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
