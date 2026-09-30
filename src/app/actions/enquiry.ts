"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Resend } from "resend";
import { enquirySchema } from "@/content";
import { env } from "@/lib/env";
import { checkEnquiryRateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { colorTokens } from "@/styles/tokens.generated";

export type EnquiryActionState = {
  success: boolean;
  errors?: Record<string, string[]>;
  formError?: string;
  values?: {
    name?: string;
    workEmail?: string;
    organisation?: string;
    phone?: string;
    enquiryType?: string;
    message?: string;
    consent?: boolean;
  };
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function submitEnquiry(
  _prevState: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const ip = forwardedFor ? (forwardedFor.split(",")[0]?.trim() ?? "127.0.0.1") : "127.0.0.1";

  // 1. Honeypot check (FR-35)
  const honeypot = formData.get("hp_website");
  if (honeypot && String(honeypot).trim().length > 0) {
    // Rejected without logging sensitive data (PRIV-08)
    return {
      success: false,
      formError: "Your enquiry could not be sent. Please send it by email instead.",
    };
  }

  // 2. Minimum elapsed time check (FR-35): minimum 2.5 seconds
  const renderedAtStr = formData.get("rendered_at");
  if (renderedAtStr) {
    const renderedAt = parseInt(String(renderedAtStr), 10);
    if (!isNaN(renderedAt)) {
      const elapsed = Date.now() - renderedAt;
      if (elapsed < 2500) {
        return {
          success: false,
          formError: "That was sent very quickly. Check your enquiry, then send it again.",
        };
      }
    }
  }

  // 3. Rate limiting (FR-36): 5 per IP / hr, 30 globally / hr
  const rateLimit = await checkEnquiryRateLimit(ip);
  if (!rateLimit.allowed) {
    return {
      success: false,
      formError: rateLimit.reason ?? "Too many enquiries. Please try again later.",
    };
  }

  // 4. Cloudflare Turnstile token verification (FR-35)
  const turnstileToken = formData.get("cf-turnstile-response");
  if (turnstileToken && typeof turnstileToken === "string" && turnstileToken.length > 0) {
    const isTokenValid = await verifyTurnstileToken(turnstileToken, ip);
    if (!isTokenValid) {
      return {
        success: false,
        formError: "The security check failed. Refresh the page and try again.",
      };
    }
  }

  // 5. Zod schema validation (FR-32)
  const rawValues = {
    name: String(formData.get("name") ?? "").trim(),
    workEmail: String(formData.get("workEmail") ?? "").trim(),
    organisation: String(formData.get("organisation") ?? "").trim() || undefined,
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    enquiryType: String(formData.get("enquiryType") ?? ""),
    message: String(formData.get("message") ?? "").trim(),
    consent: formData.get("consent") === "on" || formData.get("consent") === "true",
  };

  const parsed = enquirySchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      values: rawValues,
      formError: "Some fields need attention. Check the highlighted fields and send again.",
    };
  }

  const validData = parsed.data;

  // 6. Transactional email delivery via Resend (FR-37)
  const resendApiKey = env.server.RESEND_API_KEY;
  const toEmail = env.server.ENQUIRY_TO_EMAIL || "enquiries@deeptsight.com.au";
  const fromEmail = env.server.ENQUIRY_FROM_EMAIL || "contact@deeptsight.com.au";

  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);

      const plainText = [
        "New enquiry via deeptsight.com.au",
        "----------------------------------------",
        `Name: ${validData.name}`,
        `Work email: ${validData.workEmail}`,
        `Organisation: ${validData.organisation ?? "Not provided"}`,
        `Phone: ${validData.phone ?? "Not provided"}`,
        `Enquiry type: ${validData.enquiryType}`,
        "",
        "Message:",
        validData.message,
        "",
        "Consent: Agreed to privacy policy",
      ].join("\n");

      // Mail clients ignore CSS variables, so colours come from the tokens generated from globals.css.
      const c = colorTokens;
      const htmlContent = `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: ${c.ink700};">
          <h2 style="color: ${c.ink900}; border-bottom: 2px solid ${c.primary}; padding-bottom: 8px;">
            New enquiry, DeepTsight Consulting
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 140px; color: ${c.steel600};">Name</td>
              <td style="padding: 8px 0; color: ${c.ink900};">${escapeHtml(validData.name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 140px; color: ${c.steel600};">Work email</td>
              <td style="padding: 8px 0; color: ${c.ink900};"><a href="mailto:${escapeHtml(validData.workEmail)}" style="color: ${c.primary};">${escapeHtml(validData.workEmail)}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 140px; color: ${c.steel600};">Organisation</td>
              <td style="padding: 8px 0; color: ${c.ink900};">${escapeHtml(validData.organisation ?? "Not provided")}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 140px; color: ${c.steel600};">Phone</td>
              <td style="padding: 8px 0; color: ${c.ink900};">${escapeHtml(validData.phone ?? "Not provided")}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 140px; color: ${c.steel600};">Enquiry type</td>
              <td style="padding: 8px 0; color: ${c.ink900};">${escapeHtml(validData.enquiryType)}</td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid ${c.rule}; margin: 20px 0;" />
          <h3 style="color: ${c.ink900}; font-size: 14px;">Message</h3>
          <p style="white-space: pre-wrap; background: ${c.ground}; color: ${c.ink900}; padding: 16px; border-radius: 4px; font-size: 15px; line-height: 1.5;">
            ${escapeHtml(validData.message)}
          </p>
        </div>
      `;

      const response = await resend.emails.send({
        from: `DeepTsight Enquiries <${fromEmail}>`,
        to: [toEmail],
        replyTo: validData.workEmail,
        subject: `[DeepTsight Enquiry] ${validData.enquiryType} from ${validData.name}`,
        text: plainText,
        html: htmlContent,
      });

      if (response.error) {
        // Log safe message without any user input details (PRIV-08)
        console.error("[Enquiry Action] Resend returned error:", response.error.name);
        return {
          success: false,
          values: rawValues,
          formError:
            "Your enquiry could not be delivered because of an email service fault. Please email contact@deeptsight.com.au directly.",
        };
      }
    } catch (error) {
      // Log safe message without user data (PRIV-08)
      console.error(
        "[Enquiry Action] Failed to deliver email:",
        error instanceof Error ? error.name : "UnknownError",
      );
      return {
        success: false,
        values: rawValues,
        formError:
          "Your enquiry could not be delivered because of an email service fault. Please email contact@deeptsight.com.au directly.",
      };
    }
  } else {
    // In local dev/preview where RESEND_API_KEY is not configured
    // Safe notification without logging personal info (PRIV-08)
    console.info("[Enquiry Action] Simulated email dispatch (RESEND_API_KEY not configured).");
  }

  // 7. Successful submission redirects to /contact/thank-you (FR-34)
  redirect("/contact/thank-you");
}
