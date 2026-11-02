"use client";

import { ArrowLeftIcon, PhoneIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OTPField, OTPFieldInput } from "@/components/ui/otp-field";
import { Radio, RadioGroup } from "@/components/ui/radio-group";
import { toastManager } from "@/components/ui/toast";
import { BRAND } from "@/lib/brand";

const OTP_LENGTH = 6;
const OTP_KEYS = Array.from({ length: OTP_LENGTH }, (_, i) => `otp-${i}`);

export default function LoginPage() {
  const router = useRouter();
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("tenant");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const validPhone = /^0[789][01]\d{8}$/.test(phone.replace(/\s/g, ""));

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!validPhone) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    setBusy(false);
    setStage("code");
    toastManager.add({ type: "info", title: "Code sent", description: "Demo: any 6 digits will work." });
  }

  async function verify(value: string) {
    setCode(value);
    if (value.length < OTP_LENGTH) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    setBusy(false);
    toastManager.add({ type: "success", title: `Welcome to ${BRAND.name}` });
    router.push(role === "tenant" ? "/search" : "/onboarding");
  }

  return (
    <div className="container flex max-w-md flex-col py-12">
      <Card>
        {stage === "phone" ? (
          <>
            <CardHeader>
              <CardTitle className="text-xl">Log in or sign up</CardTitle>
              <CardDescription>We’ll text you a 6-digit code. No passwords.</CardDescription>
            </CardHeader>
            <CardPanel>
              <Form onSubmit={sendCode} className="flex flex-col gap-5">
                <Field>
                  <FieldLabel>Phone number</FieldLabel>
                  <Input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0803 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    aria-invalid={phone.length > 6 && !validPhone ? true : undefined}
                  />
                  <FieldDescription>Nigerian mobile number, e.g. 0803…</FieldDescription>
                  <FieldError match={phone.length > 6 && !validPhone}>That doesn’t look like a Nigerian mobile number.</FieldError>
                </Field>
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-2 font-medium text-sm">I’m here to…</legend>
                  <RadioGroup value={role} onValueChange={(v) => setRole(String(v))} className="grid gap-2 sm:grid-cols-3">
                    {[
                      ["tenant", "Find a home"],
                      ["owner", "Rent out my property"],
                      ["agent", "List as an agent"],
                    ].map(([value, label]) => (
                      <Label key={value} className="flex cursor-pointer items-center gap-2 rounded-xl border p-3 has-data-checked:border-primary has-data-checked:bg-primary/5">
                        <Radio value={value} />
                        {label}
                      </Label>
                    ))}
                  </RadioGroup>
                </fieldset>
                <Button type="submit" size="lg" disabled={!validPhone} loading={busy}>
                  <PhoneIcon />
                  Send code
                </Button>
              </Form>
            </CardPanel>
          </>
        ) : (
          <>
            <CardHeader>
              <Button variant="ghost" size="sm" className="-ms-2 mb-2 self-start" onClick={() => setStage("phone")}>
                <ArrowLeftIcon />
                Change number
              </Button>
              <CardTitle className="text-xl">Enter the code</CardTitle>
              <CardDescription>Sent to {phone}. It expires in 10 minutes.</CardDescription>
            </CardHeader>
            <CardPanel className="flex flex-col gap-4">
              <Field>
                <FieldLabel className="sr-only">One-time code</FieldLabel>
                <OTPField length={OTP_LENGTH} value={code} onValueChange={verify} disabled={busy}>
                  {OTP_KEYS.map((k, i) => (
                    <OTPFieldInput key={k} aria-label={i === 0 ? undefined : `Digit ${i + 1} of ${OTP_LENGTH}`} />
                  ))}
                </OTPField>
              </Field>
              <Button variant="link" className="self-start px-0" onClick={() => toastManager.add({ title: "New code sent" })}>
                Resend code
              </Button>
            </CardPanel>
          </>
        )}
      </Card>
    </div>
  );
}
