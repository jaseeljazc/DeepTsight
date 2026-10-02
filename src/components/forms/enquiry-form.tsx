"use client";

import * as React from "react";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { buildEnquirySchema, type EnquiryData } from "@/content/enquiry-schema";
import type { EnquiryOptions } from "@/content/types";
import { submitEnquiry, type EnquiryActionState } from "@/app/actions/enquiry";
import { Field, FieldError } from "@/components/primitives/field";
import { Link } from "@/components/primitives/link";
import { Input } from "@/components/primitives/input";
import { Select } from "@/components/primitives/select";
import { Textarea } from "@/components/primitives/textarea";
import { Checkbox } from "@/components/primitives/checkbox";
import { Button } from "@/components/primitives/button";
import { trackEvent } from "@/lib/analytics";
import { publicEnv } from "@/lib/public-env";
import { ErrorSummary, type ErrorSummaryItem } from "./error-summary";

const initialActionState: EnquiryActionState = {
  success: false,
};

export type EnquiryFormProps = {
  options: EnquiryOptions;
};

export function EnquiryForm({ options }: EnquiryFormProps) {
  const [state, formAction, isPending] = useActionState(submitEnquiry, initialActionState);
  // A stable key for the list, so the schema is rebuilt only when the types change.
  const typeValuesKey = JSON.stringify(options.types.map((type) => type.value));
  const enquirySchema = React.useMemo(
    () => buildEnquirySchema(JSON.parse(typeValuesKey) as string[]),
    [typeValuesKey],
  );
  const formRef = useRef<HTMLFormElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  const renderedAtRef = useRef<number>(0);
  const hasStartedRef = useRef<boolean>(false);
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  /** Set when a submit fails client validation; the summary is focused once it has rendered. */
  const focusSummaryRef = useRef<boolean>(false);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const handleInteraction = () => {
    if (renderedAtRef.current === 0) {
      renderedAtRef.current = Date.now();
    }
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      trackEvent("enquiry_started");
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors: clientErrors },
  } = useForm<EnquiryData>({
    // Built from the types this page was rendered with, as the Server Action does.
    resolver: zodResolver(enquirySchema),
    mode: "onBlur",
    // The error summary takes focus on a failed submit (FR-33); its links lead to each field.
    shouldFocusError: false,
    defaultValues: {
      name: state.values?.name ?? "",
      workEmail: state.values?.workEmail ?? "",
      organisation: state.values?.organisation ?? "",
      phone: state.values?.phone ?? "",
      enquiryType: state.values?.enquiryType ?? undefined,
      message: state.values?.message ?? "",
      consent: state.values?.consent ?? false,
    },
  });

  // Consolidate errors from both client-side validation and server action response
  const nameError = clientErrors.name?.message ?? state.errors?.["name"]?.[0];
  const emailError = clientErrors.workEmail?.message ?? state.errors?.["workEmail"]?.[0];
  const orgError = clientErrors.organisation?.message ?? state.errors?.["organisation"]?.[0];
  const phoneError = clientErrors.phone?.message ?? state.errors?.["phone"]?.[0];
  const typeError = clientErrors.enquiryType?.message ?? state.errors?.["enquiryType"]?.[0];
  const messageError = clientErrors.message?.message ?? state.errors?.["message"]?.[0];
  const consentError = clientErrors.consent?.message ?? state.errors?.["consent"]?.[0];

  const errorList: ErrorSummaryItem[] = [];
  if (nameError) errorList.push({ id: "contact-name", message: nameError });
  if (emailError) errorList.push({ id: "contact-email", message: emailError });
  if (orgError) errorList.push({ id: "contact-org", message: orgError });
  if (phoneError) errorList.push({ id: "contact-phone", message: phoneError });
  if (typeError) errorList.push({ id: "contact-type", message: typeError });
  if (messageError) errorList.push({ id: "contact-message", message: messageError });
  if (consentError) errorList.push({ id: "contact-consent", message: consentError });

  const hasErrors = errorList.length > 0 || Boolean(state.formError);

  /*
   * Focus the error summary after a failed submit only (FR-33, A11Y-13). An error that appears on
   * blur does neither of the two things below, so focus stays where the visitor is typing.
   * 1. Client validation: React Hook Form renders its errors after calling onInvalid, so the flag
   *    is checked after every render until the summary exists.
   * 2. Server response: the summary renders in the same pass as the new state.
   */
  useEffect(() => {
    if (focusSummaryRef.current && errorSummaryRef.current) {
      focusSummaryRef.current = false;
      errorSummaryRef.current.focus();
    }
  });

  useEffect(() => {
    errorSummaryRef.current?.focus();
  }, [state]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    handleSubmit(
      () => {
        // Track submission event (AN-01)
        trackEvent("enquiry_submitted");

        // Validation succeeded on client; dispatch server action
        startTransition(() => {
          if (formRef.current) {
            const formData = new FormData(formRef.current);
            if (turnstileToken) {
              formData.set("cf-turnstile-response", turnstileToken);
            }
            if (renderedAtRef.current > 0) {
              formData.set("rendered_at", String(renderedAtRef.current));
            }
            formAction(formData);
            // Turnstile tokens are single-use: request a fresh one in case this attempt fails.
            setTurnstileToken("");
            turnstileRef.current?.reset();
          }
        });
      },
      (errors) => {
        // Track validation error field names only (AN-02) — NO PII captured
        const invalidFields = Object.keys(errors).join(", ");
        trackEvent("form_validation_error", { invalidFields });

        // Client validation failed: focus the summary once the errors have rendered
        focusSummaryRef.current = true;
      },
    )(e);
  };

  return (
    <div className="relative">
      {hasErrors && (
        <ErrorSummary ref={errorSummaryRef} title={state.formError} items={errorList} />
      )}

      <form
        ref={formRef}
        action={formAction}
        onSubmit={onSubmit}
        onFocusCapture={handleInteraction}
        onPointerDownCapture={handleInteraction}
        className="space-y-6"
        noValidate
      >
        {/* Honeypot field (FR-35) */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="hp_website">Leave this field empty</label>
          <input type="text" id="hp_website" name="hp_website" tabIndex={-1} autoComplete="off" />
        </div>

        {/* Hidden token for Turnstile */}
        {turnstileToken && (
          <input type="hidden" name="cf-turnstile-response" value={turnstileToken} />
        )}

        {/* Name (FR-30, A11Y-12) */}
        <Field id="contact-name" label="Your name" required error={nameError}>
          {(fieldProps) => {
            const { ref, ...rest } = register("name");
            return (
              <Input
                {...fieldProps}
                {...rest}
                ref={ref}
                name="name"
                autoComplete="name"
                hasError={Boolean(nameError)}
                defaultValue={state.values?.name}
                required
              />
            );
          }}
        </Field>

        {/* Work email (FR-30, A11Y-12) */}
        <Field id="contact-email" label="Work email" required error={emailError}>
          {(fieldProps) => {
            const { ref, ...rest } = register("workEmail");
            return (
              <Input
                {...fieldProps}
                {...rest}
                ref={ref}
                type="email"
                name="workEmail"
                autoComplete="email"
                hasError={Boolean(emailError)}
                defaultValue={state.values?.workEmail}
                required
              />
            );
          }}
        </Field>

        {/* Organisation & Phone (FR-30, A11Y-12) */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field id="contact-org" label="Organisation" error={orgError}>
            {(fieldProps) => {
              const { ref, ...rest } = register("organisation");
              return (
                <Input
                  {...fieldProps}
                  {...rest}
                  ref={ref}
                  name="organisation"
                  autoComplete="organization"
                  placeholder="Company name"
                  hasError={Boolean(orgError)}
                  defaultValue={state.values?.organisation}
                />
              );
            }}
          </Field>

          <Field id="contact-phone" label="Phone" error={phoneError}>
            {(fieldProps) => {
              const { ref, ...rest } = register("phone");
              return (
                <Input
                  {...fieldProps}
                  {...rest}
                  ref={ref}
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  hasError={Boolean(phoneError)}
                  defaultValue={state.values?.phone}
                />
              );
            }}
          </Field>
        </div>

        {/* Enquiry Type (FR-30) */}
        <Field id="contact-type" label="Area of enquiry" required error={typeError}>
          {(fieldProps) => {
            const { ref, ...rest } = register("enquiryType");
            return (
              <Select
                {...fieldProps}
                {...rest}
                ref={ref}
                name="enquiryType"
                hasError={Boolean(typeError)}
                defaultValue={state.values?.enquiryType ?? ""}
                required
              >
                <option value="">{options.placeholder}</option>
                {options.types.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            );
          }}
        </Field>

        {/* Message (FR-30) */}
        <Field
          id="contact-message"
          label="Describe the challenge"
          required
          helperText="Please leave out site names, network details and vulnerability information."
          error={messageError}
        >
          {(fieldProps) => {
            const { ref, ...rest } = register("message");
            return (
              <Textarea
                {...fieldProps}
                {...rest}
                ref={ref}
                name="message"
                rows={5}
                hasError={Boolean(messageError)}
                defaultValue={state.values?.message}
                required
              />
            );
          }}
        </Field>

        {/* Consent Checkbox (FR-30, FR-39) */}
        <div className="pt-2">
          {(() => {
            const { ref, ...rest } = register("consent");
            return (
              <Checkbox
                {...rest}
                ref={ref}
                id="contact-consent"
                name="consent"
                hasError={Boolean(consentError)}
                defaultChecked={state.values?.consent}
                aria-describedby={consentError ? "contact-consent-error" : undefined}
                aria-invalid={Boolean(consentError)}
                required
                label="I consent to DeepTsight using these details only to respond to this enquiry."
              />
            );
          })()}
          {consentError && (
            <FieldError id="contact-consent-error" className="mt-1">
              {consentError}
            </FieldError>
          )}
        </div>

        {/* Cloudflare Turnstile Widget (FR-35) */}
        {mounted && (
          <div className="py-2">
            <Turnstile
              ref={turnstileRef}
              siteKey={publicEnv.turnstileSiteKey}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken("")}
            />
          </div>
        )}

        {/* Actions & Privacy link (FR-39) */}
        <div className="border-rule border-t pt-6">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isPending}
            disabled={isPending}
          >
            {isPending ? "Sending enquiry" : "Send enquiry"}
          </Button>
          <p className="text-steel-600 text-small mt-4">
            Your details are used only to respond to this enquiry. See the{" "}
            <Link href="/legal/privacy" variant="inline">
              privacy notice
            </Link>{" "}
            for what is collected and why.
          </p>
        </div>
      </form>
    </div>
  );
}
