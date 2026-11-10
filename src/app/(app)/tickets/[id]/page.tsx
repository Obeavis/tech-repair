import { notFound } from "next/navigation";

import {
  approveEstimateAction,
  declineEstimateAction,
  sendMessageAction,
} from "@/app/(app)/tickets/actions";
import { EstimateDecision } from "@/app/(app)/tickets/[id]/estimate-decision";
import { MessageForm } from "@/app/(app)/tickets/[id]/message-form";
import { StatusBadge } from "@/components/ticket/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEVICE_TYPE_LABELS, STATUS_LABELS } from "@/domain/ticket/labels";
import { AppError } from "@/lib/app-error";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { requireUser } from "@/server/auth/current-user";
import { getRepository } from "@/server/repository";
import { getTicketDetail } from "@/server/tickets/get-ticket";

export async function generateMetadata(props: PageProps<"/tickets/[id]">) {
  const { id } = await props.params;
  return { title: `${id} · Tech Repair` };
}

export default async function TicketPage(props: PageProps<"/tickets/[id]">) {
  const { id } = await props.params;
  const user = await requireUser();

  let detail;
  try {
    detail = await getTicketDetail(getRepository(), user, id);
  } catch (error) {
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  }
  const { ticket, technician, messages, history, authors } = detail;
  const estimate = ticket.estimate;
  const decidable =
    user.role === "customer" &&
    ticket.status === "awaiting_approval" &&
    estimate?.approval === "pending";

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <header className="grid gap-2">
        <p className="font-mono text-sm text-muted-foreground">{ticket.id}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-2xl font-semibold">{ticket.deviceModel}</h1>
          <StatusBadge status={ticket.status} />
        </div>
        <p className="text-muted-foreground">
          {DEVICE_TYPE_LABELS[ticket.deviceType]}
          {ticket.serialNumber && ` · Serial ${ticket.serialNumber}`}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Problem</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="whitespace-pre-wrap">{ticket.problem}</p>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Technician</dt>
              <dd>{technician?.name ?? "Not assigned yet"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Expected completion</dt>
              <dd>
                {ticket.expectedCompletionAt
                  ? formatDate(ticket.expectedCompletionAt)
                  : "To be confirmed"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Diagnosis</dt>
              <dd>{ticket.diagnosis ?? "Not diagnosed yet"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estimate</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!estimate && (
            <p className="text-muted-foreground">
              No estimate yet. We will send one after the diagnosis.
            </p>
          )}
          {estimate && (
            <>
              <p className="text-2xl font-semibold">
                {formatMoney(estimate.amountCents)}
              </p>
              {estimate.approval === "approved" && (
                <p>This estimate was approved.</p>
              )}
              {estimate.approval === "declined" && (
                <p>This estimate was declined: {estimate.declineReason}</p>
              )}
              {estimate.approval === "pending" && !decidable && (
                <p className="text-muted-foreground">
                  This estimate is waiting for approval.
                </p>
              )}
            </>
          )}
          {decidable && (
            <EstimateDecision
              approve={approveEstimateAction.bind(null, ticket.id)}
              decline={declineEstimateAction.bind(null, ticket.id)}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-3">
            {history.map((change) => (
              <li key={change.id} className="text-sm">
                <p className="font-medium">
                  {change.from === null
                    ? "Request opened"
                    : STATUS_LABELS[change.to]}
                </p>
                <p className="text-muted-foreground">
                  {authors[change.actorId] ?? "Unknown"} ·{" "}
                  {formatDateTime(change.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          {messages.length === 0 && (
            <p className="text-muted-foreground">No messages yet.</p>
          )}
          {messages.length > 0 && (
            <ul className="grid gap-4">
              {messages.map((message) => (
                <li key={message.id} className="grid gap-1 text-sm">
                  <p className="text-muted-foreground">
                    {message.authorId === user.id
                      ? "You"
                      : (authors[message.authorId] ?? "Unknown")}
                    {message.kind === "internal_note" && " · Internal note"} ·{" "}
                    {formatDateTime(message.createdAt)}
                  </p>
                  <p className="whitespace-pre-wrap">{message.body}</p>
                </li>
              ))}
            </ul>
          )}
          <MessageForm action={sendMessageAction.bind(null, ticket.id)} />
        </CardContent>
      </Card>
    </div>
  );
}
