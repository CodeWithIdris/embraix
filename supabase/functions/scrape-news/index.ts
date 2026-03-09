import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !LOVABLE_API_KEY) {
      throw new Error("Missing required environment variables");
    }

    // RSS feeds for clean energy news
    const rssFeeds = [
      "https://news.google.com/rss/search?q=clean+energy+Africa&hl=en&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=solar+power+renewable+energy&hl=en&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=electric+vehicles+energy+storage&hl=en&gl=US&ceid=US:en",
    ];

    const allItems: Array<{ title: string; link: string; description: string; pubDate: string; source: string }> = [];

    // Fetch and parse RSS feeds
    for (const feedUrl of rssFeeds) {
      try {
        const res = await fetch(feedUrl);
        if (!res.ok) continue;
        const xml = await res.text();

        // Simple XML parsing for RSS items
        const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
        for (const item of items.slice(0, 5)) {
          const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() || "";
          const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || "";
          const description = item.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]*>/g, "").trim() || "";
          const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || "";
          const source = item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() || "Google News";

          if (title && title.length > 10) {
            allItems.push({ title, link, description, pubDate, source });
          }
        }
      } catch (e) {
        console.error(`Failed to fetch feed ${feedUrl}:`, e);
      }
    }

    if (allItems.length === 0) {
      return new Response(JSON.stringify({ message: "No news items found from RSS feeds" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check existing posts to avoid duplicates (by title similarity)
    const existingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/news_posts?select=title&order=created_at.desc&limit=50`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    const existingPosts = await existingRes.json();
    const existingTitles = new Set((existingPosts || []).map((p: any) => p.title?.toLowerCase().trim()));

    // Filter out duplicates
    const newItems = allItems.filter(
      (item) => !existingTitles.has(item.title.toLowerCase().trim())
    ).slice(0, 5); // Process max 5 new articles per run

    if (newItems.length === 0) {
      return new Response(JSON.stringify({ message: "No new unique articles found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get or create a system author (use service role to find admin)
    const adminRes = await fetch(
      `${SUPABASE_URL}/rest/v1/user_roles?role=eq.admin&select=user_id&limit=1`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    const admins = await adminRes.json();
    const authorId = admins?.[0]?.user_id;

    if (!authorId) {
      throw new Error("No admin user found to attribute scraped news to");
    }

    let created = 0;
    let errors = 0;

    for (const item of newItems) {
      try {
        // Use AI to rewrite the article
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content: `You are a professional clean energy journalist writing for Embraix, Africa's leading clean energy platform. Rewrite news articles in an engaging, original style. Never copy text verbatim. Always attribute the original source.

Return a JSON object with these fields:
- title: A rewritten, engaging headline (max 120 chars)
- excerpt: A 1-2 sentence summary (max 200 chars)  
- content: The full rewritten article in HTML format (3-5 paragraphs). Include source attribution at the end as: <p><em>Source: [Original Source Name]</em></p>
- category: One of: "clean_energy", "solar", "ev", "storage", "climate_tech", "policy", "innovation"

IMPORTANT: Return ONLY valid JSON, no markdown code blocks.`,
              },
              {
                role: "user",
                content: `Rewrite this news article:\n\nTitle: ${item.title}\nDescription: ${item.description}\nSource: ${item.source}\nOriginal URL: ${item.link}`,
              },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "format_article",
                  description: "Format the rewritten article",
                  parameters: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Rewritten headline" },
                      excerpt: { type: "string", description: "Brief summary" },
                      content: { type: "string", description: "Full HTML article content" },
                      category: { type: "string", enum: ["clean_energy", "solar", "ev", "storage", "climate_tech", "policy", "innovation"] },
                    },
                    required: ["title", "excerpt", "content", "category"],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "format_article" } },
          }),
        });

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          console.error(`AI rewrite failed (${aiResponse.status}):`, errText);
          errors++;
          continue;
        }

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        
        if (!toolCall?.function?.arguments) {
          console.error("No tool call in AI response");
          errors++;
          continue;
        }

        const article = JSON.parse(toolCall.function.arguments);

        // Insert the rewritten article as an approved news post
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/news_posts`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            title: article.title,
            content: article.content,
            excerpt: article.excerpt,
            author_id: authorId,
            status: "approved",
            published_at: new Date().toISOString(),
          }),
        });

        if (insertRes.ok) {
          created++;
        } else {
          const errText = await insertRes.text();
          console.error(`Failed to insert post:`, errText);
          errors++;
        }

        // Small delay between AI calls to avoid rate limiting
        await new Promise((r) => setTimeout(r, 1000));
      } catch (e) {
        console.error(`Error processing article "${item.title}":`, e);
        errors++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, created, errors, totalFound: allItems.length, newUnique: newItems.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("News scraping error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
