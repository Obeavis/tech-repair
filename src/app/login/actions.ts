"use server";

import { redirect } from "next/navigation";

import { AppError, type FieldErrors } from "@/lib/app-error";
import { createSession, destroySession } from "@/server/auth/session";
import { signIn } from "@/server/auth/sign-in";
import { getRepository } from "@/server/repository";

export type SignInState = {
  error?: string;
  fields?: FieldErrors;
  email?: string;
};

export async function signInAction(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  try {
    const user = await signIn(getRepository(), Object.fromEntries(formData));
    await createSession(user.id);
  } catch (error) {
    if (!(error instanceof AppError)) throw error;
    return {
      error: error.message,
      fields: error.fields,
      email: String(formData.get("email") ?? ""),
    };
  }
  redirect("/");
}

export async function demoSignInAction(formData: FormData) {
  await signInAction({}, formData);
}

export async function signOutAction() {
  await destroySession();
  redirect("/login");
}
