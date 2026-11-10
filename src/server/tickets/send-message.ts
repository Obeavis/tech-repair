import { z } from "zod";

import type { Actor } from "@/domain/actor";
import { assertCanView } from "@/domain/ticket/permissions";
import type { Message } from "@/domain/ticket/types";
import { AppError } from "@/lib/app-error";
import { parseInput } from "@/lib/parse-input";
import type { Repository } from "@/server/repository/repository";

export const messageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Write a message")
    .max(2000, "Use 2000 characters or fewer"),
});

export async function sendMessage(
  repo: Repository,
  actor: Actor,
  ticketId: string,
  input: unknown,
): Promise<Message> {
  const ticket = await repo.tickets.get(ticketId);
  if (!ticket) throw new AppError(404, "Ticket not found");
  assertCanView(actor, ticket);

  const { body } = parseInput(messageSchema, input);
  return repo.messages.add({
    ticketId,
    authorId: actor.id,
    kind: "message",
    body,
  });
}
