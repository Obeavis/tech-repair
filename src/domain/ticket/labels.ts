import type { DeviceType, TicketStatus } from "@/domain/ticket/types";

export const STATUS_LABELS: Record<TicketStatus, string> = {
  new: "New",
  diagnosing: "Diagnosing",
  awaiting_approval: "Awaiting approval",
  awaiting_parts: "Awaiting parts",
  in_repair: "In repair",
  ready_for_pickup: "Ready for pickup",
  completed: "Completed",
  declined: "Declined",
  cancelled: "Cancelled",
};

export type StatusTone = "neutral" | "info" | "warning" | "success" | "danger";

export const STATUS_TONES: Record<TicketStatus, StatusTone> = {
  new: "neutral",
  diagnosing: "info",
  awaiting_approval: "warning",
  awaiting_parts: "warning",
  in_repair: "info",
  ready_for_pickup: "success",
  completed: "neutral",
  declined: "danger",
  cancelled: "neutral",
};

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  phone: "Phone",
  laptop: "Laptop",
  tablet: "Tablet",
  desktop: "Desktop",
  game_console: "Game console",
  headphones: "Headphones",
  other: "Other",
};
