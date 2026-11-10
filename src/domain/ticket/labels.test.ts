import { describe, expect, it } from "vitest";

import {
  DEVICE_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_TONES,
} from "@/domain/ticket/labels";
import { DEVICE_TYPES, TICKET_STATUSES } from "@/domain/ticket/types";

describe("ticket labels", () => {
  it("has a label and a tone for every status", () => {
    for (const status of TICKET_STATUSES) {
      expect(STATUS_LABELS[status]).toBeTruthy();
      expect(STATUS_TONES[status]).toBeTruthy();
    }
  });

  it("has a label for every device type", () => {
    for (const type of DEVICE_TYPES) {
      expect(DEVICE_TYPE_LABELS[type]).toBeTruthy();
    }
  });
});
