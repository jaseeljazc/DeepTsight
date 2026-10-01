"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Resend } from "resend";
import { buildEnquirySchema, getEnquiryOptions, getSite } from "@/content";
import { env } from "@/lib/env";
import { siteHost } from "@/lib/site-url";
import { checkEnquiryRateLimit, clientIp } from "@/lib/rate-limit";
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

/** Minimum time between the page being ready and the enquiry being sent (ARCHITECTURE.md §6). */
const MIN_ELAPSED_MS = 3000;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/*
 * Order (ARCHITECTURE.md §4.4, §6): honeypot, validation, rate limit, CAPTCHA and timing, send.
 * Validation runs before the rate limit so that correcting a mistake does not use up the
 * visitor's allowance (FR-36). Nothing from the form is ever logged (PRIV-08).
 */
export async function submitEnquiry(
  _prevState: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  const site = await getSite();
  const emailFallback = `Please email ${site.email} directly.`;

  // 1. Honeypot (FR-35)
  const honeypot = formData.get("hp_website");
  if (honeypot && String(honeypot).trim().length > 0) {
    return {
      success: false,
      formError: `Your enquiry could not be sent. ${emailFallback}`,
    };
  }

  // 2. Validation with the shared schema (FR-32)
  const rawValues = {
    name: String(formData.get("name") ?? "").trim(),
    workEmail: String(formData.get("workEmail") ?? "").trim(),
    organisation: String(formData.get("organisation") ?? "").trim() || undefined,
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    enquiryType: String(formData.get("enquiryType") ?? ""),
    message: String(formData.get("message") ?? "").trim(),
    consent: formData.get("consent") === "on" || formData.get("consent") === "true",
  };

  // Validated against the enquiry types enabled now, not those the page was built with.
  const { types } = await getEnquiryOptions();
  const enquirySchema = buildEnquirySchema(types.map((type) => type.value));
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

  // 3. Rate limit, counted only for valid submissions (FR-36)
  const ip = clientIp(await headers());
  const rateLimit = await checkEnquiryRateLimit(ip);
  if (!rateLimit.allowed) {
    return {
      success: false,
      values: rawValues,
      formError: rateLimit.reason ?? "Too many enquiries. Please try again later.",
    };
  }

  // 4. Turnstile and the elapsed-time check (FR-35, SEC-08). On the live site a missing token is
  //    a failure: skipping the check when the field is absent would let any script bypass it.
  const turnstileToken = formData.get("cf-turnstile-response");
  const hasToken = typeof turnstileToken === "string" && turnstileToken.length > 0;
  let challengeAt: number | undefined;

  if (hasToken) {
    const result = await verifyTurnstileToken(turnstileToken, ip);
    if (!result.success) {
      return {
        success: false,
        values: rawValues,
        formError: "The security check failed. Wait a moment, then send your enquiry again.",
      };
    }
    challengeAt = result.challengeAt;
  } else if (env.isProductionSite) {
    return {
      success: false,
      values: rawValues,
      formError: `The security check needs JavaScript and has not finished. Wait a moment and send again, or email ${site.email}.`,
    };
  }

  // Prefer Cloudflare's own timestamp, which the visitor cannot set. The form's rendered_at is a
  // fallback for development, where the test key returns no timestamp.
  const renderedAt = Number.parseInt(String(formData.get("rendered_at") ?? ""), 10);
  const startedAt = challengeAt ?? (Number.isNaN(renderedAt) ? undefined : renderedAt);
  if (startedAt !== undefined && Date.now() - startedAt < MIN_ELAPSED_MS) {
    return {
      success: false,
      values: rawValues,
      formError: "That was sent very quickly. Check your enquiry, then send it again.",
    };
  }

  // 5. Delivery by email (FR-37). The live site always has a key (src/lib/env.ts); the simulated
  //    path exists only for development and preview.
  const { RESEND_API_KEY, ENQUIRY_TO_EMAIL, ENQUIRY_FROM_EMAIL } = env.server;
  const deliveryFailed: EnquiryActionState = {
    success: false,
    values: rawValues,
    formError: `Your enquiry could not be delivered because of an email service fault. ${emailFallback}`,
  };

  if (!RESEND_API_KEY || !ENQUIRY_TO_EMAIL || !ENQUIRY_FROM_EMAIL) {
    if (env.isProductionSite) {
      console.error("[Enquiry Action] Email delivery is not configured.");
      return deliveryFailed;
    }
    console.info("[Enquiry Action] Simulated email dispatch (email delivery not configured).");
    redirect("/contact/thank-you");
  }

  try {
    const resend = new Resend(RESEND_API_KEY);

    const plainText = [
      `New enquiry via ${siteHost}`,
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
            New enquiry, ${escapeHtml(site.displayName)}
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
      from: `${site.displayName} Enquiries <${ENQUIRY_FROM_EMAIL}>`,
      to: [ENQUIRY_TO_EMAIL],
      replyTo: validData.workEmail,
      subject: `[${site.displayName} Enquiry] ${validData.enquiryType} from ${validData.name}`,
      text: plainText,
      html: htmlContent,
    });

    if (response.error) {
      console.error("[Enquiry Action] Resend returned error:", response.error.name);
      return deliveryFailed;
    }
  } catch (error) {
    console.error(
      "[Enquiry Action] Failed to deliver email:",
      error instanceof Error ? error.name : "UnknownError",
    );
    return deliveryFailed;
  }

  // 6. Success (FR-34)
  redirect("/contact/thank-you");
}
