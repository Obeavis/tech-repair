import { redirect } from "next/navigation";
import { Suspense } from "react";

import { signInAction } from "@/app/login/actions";
import { DemoAccounts } from "@/app/login/demo-accounts";
import { LoginForm } from "@/app/login/login-form";
import { getCurrentUser } from "@/server/auth/current-user";

export const metadata = { title: "Sign in · Tech Repair" };

async function RedirectIfSignedIn() {
  if (await getCurrentUser()) redirect("/");
  return null;
}

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 p-4 py-10 sm:p-6">
      <header className="grid gap-1">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to see your repairs.</p>
      </header>

      <Suspense>
        <RedirectIfSignedIn />
      </Suspense>

      <LoginForm action={signInAction} />

      <Suspense>
        <DemoAccounts />
      </Suspense>
    </main>
  );
}
