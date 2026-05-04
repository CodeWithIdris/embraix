import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const VALID_CATEGORIES = [
  "solar_panels",
  "batteries",
  "inverters",
  "ev_chargers",
  "smart_devices",
  "accessories",
  "bundles",
  "clean_cooking",
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
  return await res.text();
}

async function extractWithAI(html: string, url: string, apiKey: string) {
  const truncated = html.slice(0, 60000);
  const prompt = `Extract product info from this page: ${url}\n\nHTML:\n${truncated}\n\nReturn ONLY JSON matching the schema.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You extract clean product data from raw HTML. Output strict JSON only. Strip HTML artifacts. Pick the best category from the provided enum." },
        { role: "user", content: prompt },
      ],
      tools: [{
        type: "function",
        function: {
          name: "save_product",
          description: "Save extracted product data",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string" },
              brand: { type: "string" },
              model: { type: "string" },
              short_description: { type: "string" },
              description: { type: "string" },
              price: { type: "number", description: "Manufacturer price as a number, no currency symbol" },
              currency: { type: "string", description: "ISO currency, e.g. NGN, USD" },
              category: { type: "string", enum: VALID_CATEGORIES },
              tags: { type: "array", items: { type: "string" } },
              images: { type: "array", items: { type: "string" }, description: "Absolute image URLs" },
              specifications: { type: "object", additionalProperties: { type: "string" } },
              warranty_years: { type: "number" },
              power_capacity: { type: "string" },
              battery_capacity: { type: "string" },
            },
            required: ["name", "category"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "save_product" } },
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI extract failed ${res.status}: ${t.slice(0, 200)}`);
  }

  const data = await res.json();
  const call = data?.choices?.[0]?.message?.tool_calls?.[0];
  if (!call?.function?.arguments) throw new Error("No structured output from AI");
  return JSON.parse(call.function.arguments);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } },
    );
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: roleRow } = await admin
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    const urls: string[] = Array.isArray(body?.urls) ? body.urls.filter((u: any) => typeof u === "string") : [];
    if (urls.length === 0 || urls.length > 20) {
      return new Response(JSON.stringify({ error: "Provide 1-20 URLs" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI key not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{ url: string; status: string; productId?: string; error?: string; name?: string }> = [];

    for (const url of urls) {
      try {
        const html = await fetchPage(url);
        const data = await extractWithAI(html, url, apiKey);

        if (!data.name) {
          results.push({ url, status: "failed", error: "No product name extracted" });
          continue;
        }

        // Duplicate check
        const namePrefix = String(data.name).slice(0, 40);
        let dupQ = admin.from("store_products").select("id, name").ilike("name", `${namePrefix}%`).limit(1);
        if (data.brand && data.model) {
          dupQ = admin.from("store_products").select("id, name").eq("brand", data.brand).eq("model", data.model).limit(1);
        }
        const { data: dup } = await dupQ;
        if (dup && dup.length > 0) {
          results.push({ url, status: "duplicate", productId: dup[0].id, name: data.name });
          continue;
        }

        const manufacturerPrice = Number(data.price) || 0;
        const finalPrice = manufacturerPrice > 0 ? manufacturerPrice * 1.12 : 0;
        const host = (() => { try { return new URL(url).hostname; } catch { return "unknown"; } })();

        const slug = `${slugify(data.name)}-${Math.random().toString(36).slice(2, 7)}`;
        const category = VALID_CATEGORIES.includes(data.category) ? data.category : "accessories";

        const { data: inserted, error: insErr } = await admin.from("store_products").insert({
          name: stripHtml(data.name).slice(0, 200),
          slug,
          brand: data.brand || null,
          model: data.model || null,
          description: data.description ? stripHtml(data.description).slice(0, 5000) : null,
          short_description: data.short_description ? stripHtml(data.short_description).slice(0, 500) : null,
          category,
          price: finalPrice,
          manufacturer_price: manufacturerPrice || null,
          markup_percent: 12,
          currency: data.currency || "NGN",
          images: Array.isArray(data.images) ? data.images.filter((i: any) => typeof i === "string").slice(0, 10) : [],
          specifications: data.specifications || {},
          tags: Array.isArray(data.tags) ? data.tags.filter((t: any) => typeof t === "string").slice(0, 20) : [],
          warranty_years: data.warranty_years || null,
          power_capacity: data.power_capacity || null,
          battery_capacity: data.battery_capacity || null,
          status: "draft",
          source: host,
          source_url: url,
          is_active: false,
        }).select("id").single();

        if (insErr) throw insErr;
        results.push({ url, status: "saved", productId: inserted.id, name: data.name });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("Scrape failed for", url, msg);
        results.push({ url, status: "failed", error: msg });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scrape-product error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
