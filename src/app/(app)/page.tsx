import Link from "next/link";

import { StatusBadge } from "@/components/ticket/status-badge";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/domain/actor";
import { DEVICE_TYPE_LABELS } from "@/domain/ticket/labels";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/server/auth/current-user";
import { getRepository } from "@/server/repository";
import { listTickets } from "@/server/tickets/list-tickets";

export default async function Home() {
  const user = await requireUser();

  if (user.role !== "customer") {
    return (
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold">
          Welcome, {user.name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          You are signed in as {ROLE_LABELS[user.role].toLowerCase()}. The
          screens for your role are coming next.
        </p>
      </div>
    );
  }

  const tickets = await listTickets(getRepository(), user);

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">My repairs</h1>
        <Button asChild>
          <Link href="/tickets/new">New repair request</Link>
        </Button>
      </header>

      {tickets.length === 0 ? (
        <p className="text-muted-foreground">
          You have no repairs yet. Send a request and we will take it from
          there.
        </p>
      ) : (
        <ul className="grid gap-3">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link
                href={`/tickets/${ticket.id}`}
                className="grid gap-2 rounded-lg bg-card p-4 shadow-card ring-1 ring-foreground/10 transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{ticket.deviceModel}</span>
                  <StatusBadge status={ticket.status} />
                </span>
                <span className="text-sm text-muted-foreground">
                  <span className="font-mono">{ticket.id}</span> ·{" "}
                  {DEVICE_TYPE_LABELS[ticket.deviceType]} · Updated{" "}
                  {formatDate(ticket.updatedAt)}
                </span>
                <span className="text-sm">{ticket.problem}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
