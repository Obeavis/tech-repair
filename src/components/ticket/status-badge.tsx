import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, STATUS_TONES } from "@/domain/ticket/labels";
import type { TicketStatus } from "@/domain/ticket/types";

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <Badge variant={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>;
}
