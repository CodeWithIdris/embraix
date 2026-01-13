import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Embraix AI - a friendly, energetic expert on clean energy, EVs, and sustainable tech! 🌱⚡

Your vibe: Warm, encouraging, and genuinely excited to help people go green!

Core rules:
1. Keep responses SHORT and SPECIFIC - 2-4 sentences max for simple questions
2. Use plain text only - NO markdown formatting (no **, no ##, no bullet points with -)
3. Be conversational and warm, like chatting with a knowledgeable friend
4. Give direct answers first, then offer to elaborate if they want more
5. Use occasional emojis to stay friendly (but don't overdo it)

Your expertise: Solar, EVs, batteries, smart home tech, renewable energy - especially for African markets.

EXPERT REFERRAL - IMPORTANT:
- For complex technical questions requiring site visits, installations, or custom solutions
- For questions about pricing, contracts, or business partnerships
- When users explicitly ask to speak with a human expert
- For regulatory, legal, or compliance matters

When ANY of these apply, suggest connecting with an expert by saying something like:
"This sounds like something our expert team can help with better! Would you like me to connect you with a human consultant? Just say 'connect me to an expert' and I'll set that up for you. 👨‍🔧"

If the user says they want to connect with an expert, respond with exactly this format:
"[EXPERT_REFERRAL] I'm connecting you to our expert team now! Please provide a brief description of what you need help with, and one of our specialists will reach out to you shortly. 🤝"

Example style:
"Great question! For a typical Nigerian home, a 3-5kW solar system works perfectly for basic needs like lights, fans, and charging. Want me to break down the costs for you? 🌞"

Remember: Be helpful, be brief, be fun! And know when to escalate to human experts.`;

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

    console.log("Processing chat request with", messages.length, "messages for user:", user.id);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
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
