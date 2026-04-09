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
    // Authenticate: require admin or service-role
    const authHeader = req.headers.get("authorization") || "";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !LOVABLE_API_KEY) {
      throw new Error("Missing required environment variables");
    }

    // If not service-role, verify the caller is admin
    if (!authHeader.includes(SUPABASE_SERVICE_ROLE_KEY)) {
      const token = authHeader.replace("Bearer ", "");
      const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_SERVICE_ROLE_KEY },
      });
      if (!userRes.ok) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const userData = await userRes.json();
      const roleRes = await fetch(
        `${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userData.id}&role=eq.admin&select=id&limit=1`,
        { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } }
      );
      const roles = await roleRes.json();
      if (!roles || roles.length === 0) {
        return new Response(JSON.stringify({ error: "Admin access required" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // RSS feeds for clean energy news
    const rssFeeds = [
      "https://news.google.com/rss/search?q=clean+energy+Africa&hl=en&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=solar+power+renewable+energy&hl=en&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=electric+vehicles+energy+storage&hl=en&gl=US&ceid=US:en",
    ];

    const allItems: Array<{ title: string; link: string; description: string; pubDate: string; source: string }> = [];

    for (const feedUrl of rssFeeds) {
      try {
        const res = await fetch(feedUrl);
        if (!res.ok) continue;
        const xml = await res.text();
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

    // Duplicate check
    const existingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/news_posts?select=title&order=created_at.desc&limit=100`,
      { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } }
    );
    const existingPosts = await existingRes.json();
    const existingTitles = new Set((existingPosts || []).map((p: any) => p.title?.toLowerCase().trim()));

    // Also check similarity (first 40 chars match = duplicate)
    const existingPrefixes = new Set((existingPosts || []).map((p: any) => p.title?.toLowerCase().trim().slice(0, 40)));

    const newItems = allItems.filter((item) => {
      const lower = item.title.toLowerCase().trim();
      return !existingTitles.has(lower) && !existingPrefixes.has(lower.slice(0, 40));
    }).slice(0, 5);

    if (newItems.length === 0) {
      return new Response(JSON.stringify({ message: "No new unique articles found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get admin author
    const adminRes = await fetch(
      `${SUPABASE_URL}/rest/v1/user_roles?role=eq.admin&select=user_id&limit=1`,
      { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } }
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
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are a senior editorial writer for Embraix, Africa's leading clean energy platform.

REWRITE RULES:
- Write in a clear, diplomatic, professional tone
- DO NOT copy original wording — rewrite everything
- Preserve the core meaning but improve clarity
- Make it readable for general users, not just experts
- Remove unnecessary technical clutter

STRUCTURE:
- Title: Engaging, clear headline (max 120 chars). Do NOT include source names.
- Excerpt: 1-2 sentence summary (max 200 chars)
- Content: Full article in clean HTML with:
  - Opening paragraph (2-3 lines, hook the reader)
  - 2-3 body paragraphs with <h3> subheadings where appropriate
  - Proper <p> tags for each paragraph
  - Clean spacing and structure
  - NO "Source:" attribution at the end
  - NO excerpt repeated at the end
  - NO raw HTML artifacts
  - NO duplicate text blocks

IMAGE RULES:
- Include 1-2 relevant Unsplash image URLs using format: <img src="https://images.unsplash.com/photo-XXXX?w=800&auto=format" alt="descriptive alt text" class="rounded-lg w-full my-4" />
- Place images naturally within the article (after first or second paragraph)
- Use real Unsplash photo IDs related to the topic (solar, energy, electric vehicles, batteries, Africa)

Return ONLY valid JSON.`,
              },
              {
                role: "user",
                content: `Rewrite this news article professionally:\n\nTitle: ${item.title}\nDescription: ${item.description}\nSource: ${item.source}`,
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
                      title: { type: "string", description: "Rewritten headline, max 120 chars" },
                      excerpt: { type: "string", description: "Brief summary, max 200 chars" },
                      content: { type: "string", description: "Full HTML article with images embedded" },
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

        // Clean up content: remove any trailing source attributions, duplicate excerpts
        let cleanedContent = article.content
          .replace(/<p>\s*<em>Source:.*?<\/em>\s*<\/p>/gi, "")
          .replace(/<p>\s*Source:.*?<\/p>/gi, "")
          .replace(/\n{3,}/g, "\n\n")
          .trim();

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
            content: cleanedContent,
            excerpt: article.excerpt,
            author_id: authorId,
            status: "approved",
            published_at: new Date().toISOString(),
            keywords: [article.category],
          }),
        });

        if (insertRes.ok) {
          created++;
        } else {
          const errText = await insertRes.text();
          console.error(`Failed to insert post:`, errText);
          errors++;
        }

        await new Promise((r) => setTimeout(r, 1500));
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
