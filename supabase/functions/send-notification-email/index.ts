import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  type: "post_approved" | "post_rejected" | "ticket_update" | "admin_new_ticket" | "admin_new_post" | "expert_reply" | "call_scheduled";
  recipientEmail: string;
  recipientName?: string;
  data: Record<string, any>;
}

const getEmailContent = (type: string, data: Record<string, any>, recipientName: string) => {
  const firstName = recipientName || "there";

  switch (type) {
    case "post_approved":
      return {
        subject: "🎉 Your Post Has Been Approved!",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #10b981; margin-bottom: 20px;">Great News, ${firstName}! 🎉</h1>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Your post "<strong>${data.postTitle}</strong>" has been approved and is now live on Embraix!
            </p>
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
              <a href="${data.postUrl}" style="color: white; text-decoration: none; font-weight: bold; font-size: 16px;">
                View Your Post →
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Thank you for contributing to our community!<br>
              <strong style="color: #10b981;">The Embraix Team</strong>
            </p>
          </div>
        `,
        text: `Great News, ${firstName}! Your post "${data.postTitle}" has been approved and is now live on Embraix! View it at: ${data.postUrl}`,
      };

    case "post_rejected":
      return {
        subject: "Update on Your Submitted Post",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #374151; margin-bottom: 20px;">Hi ${firstName},</h1>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Unfortunately, your post "<strong>${data.postTitle}</strong>" was not approved for publication.
            </p>
            ${data.reason ? `
              <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                <p style="color: #b91c1c; margin: 0; font-size: 14px;"><strong>Reason:</strong> ${data.reason}</p>
              </div>
            ` : ''}
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              You can edit and resubmit your post from your profile page. We'd love to see a revised version!
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              <strong style="color: #10b981;">The Embraix Team</strong>
            </p>
          </div>
        `,
        text: `Hi ${firstName}, Unfortunately, your post "${data.postTitle}" was not approved for publication. ${data.reason ? `Reason: ${data.reason}` : ''} You can edit and resubmit your post from your profile page.`,
      };

    case "admin_new_ticket":
      return {
        subject: "🔔 New Consultation Request",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #f59e0b; margin-bottom: 20px;">🔔 New Consultation Request</h1>
            <div style="background: #fffbeb; border: 1px solid #fbbf24; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${data.userName || data.userEmail}</p>
              <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${data.subject}</p>
              <p style="margin: 0 0 10px 0;"><strong>Priority:</strong> ${data.priority || 'Normal'}</p>
              <p style="margin: 0;"><strong>Description:</strong><br>${data.description}</p>
            </div>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${data.dashboardUrl}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold;">
                View in Dashboard →
              </a>
            </div>
          </div>
        `,
        text: `New Consultation Request from ${data.userName || data.userEmail}. Subject: ${data.subject}. Description: ${data.description}. View in dashboard: ${data.dashboardUrl}`,
      };

    case "admin_new_post":
      return {
        subject: "📝 New Post Pending Review",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #3b82f6; margin-bottom: 20px;">📝 New Post Pending Review</h1>
            <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Title:</strong> ${data.postTitle}</p>
              <p style="margin: 0 0 10px 0;"><strong>Author:</strong> ${data.authorName || data.authorEmail}</p>
              ${data.excerpt ? `<p style="margin: 0;"><strong>Excerpt:</strong> ${data.excerpt}</p>` : ''}
            </div>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${data.dashboardUrl}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold;">
                Review Post →
              </a>
            </div>
          </div>
        `,
        text: `New Post Pending Review. Title: ${data.postTitle}. Author: ${data.authorName || data.authorEmail}. Review in dashboard: ${data.dashboardUrl}`,
      };

    case "expert_reply":
      return {
        subject: "🎉 Expert Response to Your Consultation",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #10b981; margin-bottom: 20px;">Great News, ${firstName}! 🎉</h1>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              An expert has responded to your consultation request: "<strong>${data.subject}</strong>"
            </p>
            <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 12px; padding: 20px; margin: 25px 0;">
              <p style="color: #166534; margin: 0 0 10px 0; font-weight: bold;">Expert Response:</p>
              <p style="color: #374151; margin: 0; white-space: pre-wrap;">${data.reply}</p>
            </div>
            ${data.expertName ? `<p style="color: #6b7280; font-size: 14px;">Response from: <strong>${data.expertName}</strong></p>` : ''}
            <div style="text-align: center; margin: 25px 0;">
              <a href="${data.consultUrl}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold;">
                View Full Response →
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Thank you for using Embraix!<br>
              <strong style="color: #10b981;">The Embraix Team</strong>
            </p>
          </div>
        `,
        text: `Great News, ${firstName}! An expert has responded to your consultation request: "${data.subject}". Reply: ${data.reply}. View at: ${data.consultUrl}`,
      };

    case "call_scheduled":
      return {
        subject: "📞 Consultation Call Scheduled",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #3b82f6; margin-bottom: 20px;">Call Scheduled! 📞</h1>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              An expert has scheduled a call to discuss your consultation request: "<strong>${data.subject}</strong>"
            </p>
            <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 12px; padding: 20px; margin: 25px 0;">
              <p style="margin: 0 0 10px 0;"><strong>📅 Date & Time:</strong> ${data.scheduledAt}</p>
              ${data.notes ? `<p style="margin: 0;"><strong>📝 Notes:</strong> ${data.notes}</p>` : ''}
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Please make sure you're available at the scheduled time. The expert will contact you using the information you provided.
            </p>
            ${data.expertName ? `<p style="color: #6b7280; font-size: 14px;">Expert: <strong>${data.expertName}</strong></p>` : ''}
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              <strong style="color: #10b981;">The Embraix Team</strong>
            </p>
          </div>
        `,
        text: `Call Scheduled! An expert has scheduled a call for your consultation request: "${data.subject}". Date & Time: ${data.scheduledAt}. ${data.notes ? `Notes: ${data.notes}` : ''}`,
      };

    default:
      return {
        subject: "Notification from Embraix",
        html: `<p>You have a new notification from Embraix.</p>`,
        text: "You have a new notification from Embraix.",
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication - require admin role for sending notifications
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Verify user with anon key first
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the JWT by getting the user
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    
    if (userError || !user) {
      console.error("JWT verification failed:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Authenticated user for send-notification-email:", user.id);

    // Use service role client to check admin role (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    
    // Verify user is admin or writer before allowing notification emails
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "writer"])
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("User is not authorized to send notifications:", user.id);
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin or Writer access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("User role verified:", roleData.role);

    const { type, recipientEmail, recipientName, data }: NotificationEmailRequest = await req.json();

    if (!type || !recipientEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending ${type} notification to:`, recipientEmail);

    const { subject, html, text } = getEmailContent(type, data, recipientName || "");

    const emailResponse = await resend.emails.send({
      from: "Embraix <hello@embraix.com>",
      reply_to: "support@embraix.com",
      to: [recipientEmail],
      subject,
      html,
      text,
      headers: {
        "X-Entity-Ref-ID": `${type}-${Date.now()}`,
        "List-Unsubscribe": "<mailto:unsubscribe@embraix.com>",
      },
    });

    console.log("Notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
