"use client";

import { useActionState } from "react";

import type { FormState } from "@/app/(app)/tickets/actions";
import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

type Props = { approve: Action; decline: Action };

export function EstimateDecision({ approve, decline }: Props) {
  const [approval, approveAction, approving] = useActionState(approve, {});
  const [refusal, declineAction, declining] = useActionState(decline, {});
  const reasonError = refusal.fields?.reason;
  const busy = approving || declining;

  return (
    <div className="grid gap-5">
      <form action={approveAction} className="grid gap-2">
        {approval.error && (
          <p role="alert" className="text-sm text-destructive">
            {approval.error}
          </p>
        )}
        <Button type="submit" className="justify-self-start" disabled={busy}>
          {approving ? "Approving…" : "Approve estimate"}
        </Button>
      </form>

      <form action={declineAction} className="grid gap-3" noValidate>
        <div className="grid gap-2">
          <Label htmlFor="reason">Reason for declining</Label>
          <Textarea
            id="reason"
            name="reason"
            rows={3}
            defaultValue={refusal.values?.reason}
            aria-invalid={reasonError ? true : undefined}
            aria-describedby={reasonError ? "reason-error" : undefined}
          />
          <FieldError id="reason-error" message={reasonError} />
        </div>
        {refusal.error && !refusal.fields && (
          <p role="alert" className="text-sm text-destructive">
            {refusal.error}
          </p>
        )}
        <Button
          type="submit"
          variant="outline"
          className="justify-self-start"
          disabled={busy}
        >
          {declining ? "Declining…" : "Decline estimate"}
        </Button>
      </form>
    </div>
  );
}
