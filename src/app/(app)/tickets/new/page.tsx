import { redirect } from "next/navigation";

import { createTicketAction } from "@/app/(app)/tickets/actions";
import { NewTicketForm } from "@/app/(app)/tickets/new/new-ticket-form";
import { requireUser } from "@/server/auth/current-user";

export const metadata = { title: "New repair request · Tech Repair" };

export default async function NewTicketPage() {
  const user = await requireUser();
  if (user.role !== "customer") redirect("/");

  return (
    <div className="mx-auto grid w-full max-w-xl gap-6">
      <header className="grid gap-1">
        <h1 className="text-2xl font-semibold">New repair request</h1>
        <p className="text-muted-foreground">
          Tell us about the device and what is wrong. We will diagnose it and
          send you an estimate.
        </p>
      </header>
      <NewTicketForm action={createTicketAction} />
    </div>
  );
}
