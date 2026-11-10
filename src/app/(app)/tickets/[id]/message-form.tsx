"use client";

import { useActionState } from "react";

import type { FormState } from "@/app/(app)/tickets/actions";
import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
};

export function MessageForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const error = state.fields?.body;

  return (
    <form action={formAction} className="grid gap-3" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="body">Message to the shop</Label>
        <Textarea
          id="body"
          name="body"
          rows={3}
          defaultValue={state.values?.body}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "body-error" : undefined}
        />
        <FieldError id="body-error" message={error} />
      </div>
      {state.error && !state.fields && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" className="justify-self-start" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
