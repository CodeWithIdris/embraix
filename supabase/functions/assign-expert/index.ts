import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { chat_id } = await req.json();
    if (!chat_id) {
      return new Response(JSON.stringify({ error: "chat_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call the auto_assign_expert function
    const { data: expertId, error } = await supabase.rpc("auto_assign_expert", {
      p_chat_id: chat_id,
    });

    if (error) {
      console.error("Auto-assign error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If no expert was assigned, notify admins
    if (!expertId) {
      console.log("No expert available, notifying admins...");

      // Get admin emails
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (adminRoles && adminRoles.length > 0) {
        const adminIds = adminRoles.map((r: any) => r.user_id);
        const { data: adminProfiles } = await supabase
          .from("profiles")
          .select("email, full_name")
          .in("id", adminIds);

        // Get chat details
        const { data: chat } = await supabase
          .from("expert_chats")
          .select("subject, expertise_area")
          .eq("id", chat_id)
          .single();

        // Send notification to each admin
        const resendKey = Deno.env.get("RESEND_API_KEY");
        if (resendKey && adminProfiles) {
          for (const admin of adminProfiles) {
            if (!admin.email) continue;
            try {
              await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${resendKey}`,
                },
                body: JSON.stringify({
                  from: "Embraix <hello@embraix.com>",
                  to: [admin.email],
                  reply_to: "support@embraix.com",
                  subject: "⚠️ No Expert Available - Client Waiting",
                  html: `
                    <h2>No Expert Available</h2>
                    <p>A client is waiting for an expert consultation but no experts are currently available.</p>
                    <p><strong>Subject:</strong> ${chat?.subject || "N/A"}</p>
                    <p><strong>Topic:</strong> ${chat?.expertise_area || "N/A"}</p>
                    <p>Please assign an expert or respond to this client as soon as possible.</p>
                  `,
                  text: `No Expert Available - A client is waiting for consultation on: ${chat?.subject}. Topic: ${chat?.expertise_area}. Please assign an expert.`,
                }),
              });
            } catch (emailErr) {
              console.error("Failed to send admin notification:", emailErr);
            }
          }
        }
      }

      return new Response(
        JSON.stringify({ assigned: false, message: "No expert available, admins notified" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ assigned: true, expert_id: expertId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Assign expert error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
