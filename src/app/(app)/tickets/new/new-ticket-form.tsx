"use client";

import { useActionState } from "react";

import type { FormState } from "@/app/(app)/tickets/actions";
import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { DEVICE_TYPE_LABELS } from "@/domain/ticket/labels";
import { DEVICE_TYPES } from "@/domain/ticket/types";

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
};

export function NewTicketForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const errors = state.fields ?? {};
  const values = state.values ?? {};
  const invalid = (name: string) => (errors[name] ? true : undefined);
  const describedBy = (name: string) =>
    errors[name] ? `${name}-error` : undefined;

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      {state.error && !state.fields && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="grid gap-2">
        <Label htmlFor="deviceType">Device type</Label>
        <NativeSelect
          id="deviceType"
          name="deviceType"
          defaultValue={values.deviceType ?? ""}
          aria-invalid={invalid("deviceType")}
          aria-describedby={describedBy("deviceType")}
        >
          <option value="" disabled>
            Choose a device type
          </option>
          {DEVICE_TYPES.map((type) => (
            <option key={type} value={type}>
              {DEVICE_TYPE_LABELS[type]}
            </option>
          ))}
        </NativeSelect>
        <FieldError id="deviceType-error" message={errors.deviceType} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="deviceModel">Brand and model</Label>
        <Input
          id="deviceModel"
          name="deviceModel"
          placeholder="iPhone 13"
          defaultValue={values.deviceModel}
          aria-invalid={invalid("deviceModel")}
          aria-describedby={describedBy("deviceModel")}
        />
        <FieldError id="deviceModel-error" message={errors.deviceModel} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="serialNumber">Serial number (optional)</Label>
        <Input
          id="serialNumber"
          name="serialNumber"
          defaultValue={values.serialNumber}
          aria-invalid={invalid("serialNumber")}
          aria-describedby={describedBy("serialNumber")}
        />
        <FieldError id="serialNumber-error" message={errors.serialNumber} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="problem">What is wrong?</Label>
        <Textarea
          id="problem"
          name="problem"
          rows={5}
          defaultValue={values.problem}
          aria-invalid={invalid("problem")}
          aria-describedby={describedBy("problem")}
        />
        <FieldError id="problem-error" message={errors.problem} />
      </div>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Send request"}
      </Button>
    </form>
  );
}
