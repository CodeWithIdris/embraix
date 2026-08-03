import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const buildSystemPrompt = (
  userContext?: {
    location?: string;
    home_size?: string;
    budget_range?: string;
    energy_goals?: string[];
    current_setup?: string;
    household_size?: number;
    property_type?: string;
    grid_reliability?: string;
    additional_notes?: string;
  },
  productCatalog?: string,
  featureMode?: string
) => {
  let contextSection = "";

  if (userContext && Object.values(userContext).some(v => v !== null && v !== undefined)) {
    contextSection = `\n\nUSER CONTEXT (reference this to personalize every response):`;
    if (userContext.location) contextSection += `\n- Location: ${userContext.location}`;
    if (userContext.property_type) contextSection += `\n- Property Type: ${userContext.property_type}`;
    if (userContext.home_size) contextSection += `\n- Home Size: ${userContext.home_size}`;
    if (userContext.household_size) contextSection += `\n- Household Size: ${userContext.household_size} people`;
    if (userContext.budget_range) contextSection += `\n- Budget Range: ${userContext.budget_range}`;
    if (userContext.current_setup) contextSection += `\n- Current Energy Setup: ${userContext.current_setup}`;
    if (userContext.grid_reliability) contextSection += `\n- Grid Reliability: ${userContext.grid_reliability}`;
    if (userContext.energy_goals?.length) contextSection += `\n- Energy Goals: ${userContext.energy_goals.join(", ")}`;
    if (userContext.additional_notes) contextSection += `\n- Additional Notes: ${userContext.additional_notes}`;
  }

  let productSection = "";
  if (productCatalog) {
    productSection = `\n\nPRODUCT CATALOG (Available products you can recommend):
${productCatalog}

PRODUCT RECOMMENDATION RULES:
- When recommending products, include a product marker: [PRODUCTS:slug1,slug2,slug3]
- Only use slugs from the catalog above. Never invent slugs.
- Recommend 2-4 products maximum per response.
- First explain WHY these products fit in 1-2 sentences, THEN place the [PRODUCTS:...] tag.
- After showing products, offer ONE relevant follow-up like "Want a cheaper option?" or "Should I compare these?"
- If no products match, say so honestly and ask a clarifying question.`;
  }

  // Feature-specific opening guidance
  let modeInstruction = "";
  if (featureMode) {
    const modeMap: Record<string, string> = {
      "Recommendations": "The user selected 'Recommendations'. Start by asking about their home/business, location, and budget — ONE question at a time. Guide them to the best product.",
      "Calculators": "The user selected 'Calculators'. Help them calculate energy costs, ROI, or system sizing. Ask what they want to calculate first.",
      "Diagnostics": "The user selected 'Diagnostics'. Help troubleshoot their energy system. Ask what issue they're experiencing.",
      "Insights": "The user selected 'Insights'. Share market trends, policy updates, or industry intelligence. Ask what topic interests them.",
      "Assistance": "The user selected 'Assistance'. Help with installation planning, provider matching, or project scoping. Ask what action they want to take.",
    };
    modeInstruction = modeMap[featureMode] || "";
    if (modeInstruction) {
      modeInstruction = `\n\nCURRENT MODE:\n${modeInstruction}`;
    }
  }

  return `You are Embraix AI — a smart energy decision engine and product advisor.

YOUR ROLE:
- Guide users to the best clean energy solutions
- Simplify decision-making with step-by-step guidance
- Recommend products and services from the Embraix platform
- Provide clear, actionable insights

CONVERSATION RULES:
1. Be CONCISE. Max 3-4 short paragraphs. No walls of text.
2. Lead with the direct answer in 1-2 sentences.
3. Use bullet points (max 4-5) instead of long paragraphs.
4. Ask only ONE follow-up question at a time — never multiple.
5. Never overwhelm the user. Build the conversation progressively.
6. Reference previous user inputs — never re-ask what they already told you.
7. Use 1-2 emojis max. Be warm but professional.

STEP-BY-STEP GUIDANCE:
- Step 1: Understand the user's situation (ask 1 question)
- Step 2: Wait for response
- Step 3: Provide tailored advice or ask a refining question
- Step 4: Recommend specific products/services when ready
- Never dump all questions at once.

FORMATTING:
- Short paragraphs (2-3 sentences max)
- Bullet points for lists
- Bold **key terms** for scannability
- End responses with a brief, relevant follow-up question

CROSS-SOLUTION AWARENESS:
- Products → recommend from Store with [PRODUCTS:slug] tags
- Services → suggest Centre for installation/maintenance
- Reports → point to Insight for market research and reports

EXPERTISE: Solar, inverters, batteries, EVs, charging, smart home, energy efficiency — focused on African markets.

EXPERT REFERRAL (for site assessments, installations, quotes):
Say: "This needs our expert team! Say 'connect me to an expert' and I'll arrange it. 👨‍🔧"
If confirmed: "[EXPERT_REFERRAL] Connecting you now! Describe what you need and a specialist will reach out. 🤝"
${contextSection}
${productSection}
${modeInstruction}`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
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
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limiting
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("api_rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("endpoint", "ai-chat")
      .gte("requested_at", oneHourAgo);

    if (count !== null && count >= 50) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabaseAdmin.from("api_rate_limits").insert({
      user_id: user.id,
      endpoint: "ai-chat",
    });

    const { messages, featureMode } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("AI service is not properly configured");

    // Fetch user preferences and product catalog in parallel
    const [prefsResult, productsResult] = await Promise.all([
      supabaseAdmin
        .from("user_ai_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabaseAdmin
        .from("store_products")
        .select("name, slug, category, brand, price, currency, power_capacity, battery_capacity, warranty_years, best_for, description")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .limit(50),
    ]);

    // Build compact product catalog string
    let productCatalog = "";
    if (productsResult.data?.length) {
      productCatalog = productsResult.data
        .map((p: any) => {
          const parts = [`${p.name} (slug: ${p.slug})`];
          if (p.category) parts.push(`cat: ${p.category}`);
          if (p.brand) parts.push(`brand: ${p.brand}`);
          parts.push(`price: ${p.price} ${p.currency}`);
          if (p.power_capacity) parts.push(`power: ${p.power_capacity}`);
          if (p.battery_capacity) parts.push(`battery: ${p.battery_capacity}`);
          if (p.warranty_years) parts.push(`warranty: ${p.warranty_years}yr`);
          if (p.best_for) parts.push(`best for: ${p.best_for}`);
          return `- ${parts.join(" | ")}`;
        })
        .join("\n");
    }

    const systemPrompt = buildSystemPrompt(
      prefsResult.data || undefined,
      productCatalog || undefined,
      featureMode || undefined
    );

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
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
