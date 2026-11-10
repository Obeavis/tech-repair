"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { AppError, type FieldErrors } from "@/lib/app-error";
import { requireUser } from "@/server/auth/current-user";
import { getRepository } from "@/server/repository";
import { createTicket } from "@/server/tickets/create-ticket";
import {
  approveTicketEstimate,
  declineTicketEstimate,
} from "@/server/tickets/decide-estimate";
import { sendMessage } from "@/server/tickets/send-message";

export type FormState = {
  error?: string;
  fields?: FieldErrors;
  values?: Record<string, string>;
  done?: boolean;
};

function failed(error: unknown, formData: FormData): FormState {
  if (!(error instanceof AppError)) throw error;
  const values = Object.fromEntries(
    [...formData].filter(([, value]) => typeof value === "string"),
  ) as Record<string, string>;
  return { error: error.message, fields: error.fields, values };
}

export async function createTicketAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  let id: string;
  try {
    const ticket = await createTicket(
      getRepository(),
      user,
      Object.fromEntries(formData),
    );
    id = ticket.id;
  } catch (error) {
    return failed(error, formData);
  }
  redirect(`/tickets/${id}`);
}

export async function sendMessageAction(
  ticketId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  try {
    await sendMessage(
      getRepository(),
      user,
      ticketId,
      Object.fromEntries(formData),
    );
  } catch (error) {
    return failed(error, formData);
  }
  revalidatePath(`/tickets/${ticketId}`);
  return { done: true };
}

export async function approveEstimateAction(
  ticketId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  try {
    await approveTicketEstimate(getRepository(), user, ticketId);
  } catch (error) {
    return failed(error, formData);
  }
  revalidatePath(`/tickets/${ticketId}`);
  return { done: true };
}

export async function declineEstimateAction(
  ticketId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  try {
    await declineTicketEstimate(
      getRepository(),
      user,
      ticketId,
      Object.fromEntries(formData),
    );
  } catch (error) {
    return failed(error, formData);
  }
  revalidatePath(`/tickets/${ticketId}`);
  return { done: true };
}
