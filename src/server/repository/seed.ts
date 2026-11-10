import type {
  Estimate,
  Message,
  StatusChange,
  Ticket,
  TicketStatus,
} from "@/domain/ticket/types";
import type { User } from "@/domain/user";
import type { SeedData } from "@/server/repository/memory-repository";

const users: User[] = [
  {
    id: "usr-elena",
    name: "Elena Brooks",
    email: "elena.brooks@example.com",
    role: "admin",
  },
  {
    id: "usr-marco",
    name: "Marco Diaz",
    email: "marco.diaz@example.com",
    role: "technician",
  },
  {
    id: "usr-priya",
    name: "Priya Shah",
    email: "priya.shah@example.com",
    role: "technician",
  },
  {
    id: "usr-jonas",
    name: "Jonas Weber",
    email: "jonas.weber@example.com",
    role: "technician",
  },
  {
    id: "usr-sarah",
    name: "Sarah Mitchell",
    email: "sarah.mitchell@example.com",
    role: "customer",
  },
  {
    id: "usr-david",
    name: "David Okafor",
    email: "david.okafor@example.com",
    role: "customer",
  },
  {
    id: "usr-linda",
    name: "Linda Park",
    email: "linda.park@example.com",
    role: "customer",
  },
  {
    id: "usr-tom",
    name: "Tom Reyes",
    email: "tom.reyes@example.com",
    role: "customer",
  },
  {
    id: "usr-aisha",
    name: "Aisha Khan",
    email: "aisha.khan@example.com",
    role: "customer",
  },
  {
    id: "usr-ben",
    name: "Ben Carter",
    email: "ben.carter@example.com",
    role: "customer",
  },
];

type Step = [status: TicketStatus, at: string, actorId: string];

type TicketFields = Pick<
  Ticket,
  | "id"
  | "customerId"
  | "technicianId"
  | "deviceType"
  | "deviceModel"
  | "problem"
> &
  Partial<
    Pick<
      Ticket,
      | "priority"
      | "serialNumber"
      | "diagnosis"
      | "estimate"
      | "expectedCompletionAt"
    >
  >;

const estimate = (
  amountCents: number,
  approval: Estimate["approval"] = "approved",
  declineReason: string | null = null,
): Estimate => ({ amountCents, approval, declineReason });

// The status and the timestamps come from the path, so a ticket and its history always agree.
function defineTicket(fields: TicketFields, path: Step[]) {
  const first = path[0];
  const last = path[path.length - 1];
  const ticket: Ticket = {
    priority: "normal",
    serialNumber: null,
    diagnosis: null,
    estimate: null,
    expectedCompletionAt: null,
    ...fields,
    status: last[0],
    createdAt: first[1],
    updatedAt: last[1],
  };
  const changes: Omit<StatusChange, "id">[] = path.map(
    ([to, at, actorId], i) => ({
      ticketId: fields.id,
      actorId,
      from: i === 0 ? null : path[i - 1][0],
      to,
      createdAt: at,
    }),
  );
  return { ticket, changes };
}

const defined = [
  defineTicket(
    {
      id: "TR-1032",
      customerId: "usr-sarah",
      technicianId: "usr-jonas",
      deviceType: "tablet",
      deviceModel: "iPad Air (4th gen)",
      problem: "Fast battery drain",
      diagnosis: "Battery at 61% health. Replacement recommended.",
      estimate: estimate(12900),
    },
    [
      ["new", "2026-09-12T09:10:00.000Z", "usr-sarah"],
      ["diagnosing", "2026-09-12T14:00:00.000Z", "usr-jonas"],
      ["awaiting_approval", "2026-09-13T10:00:00.000Z", "usr-jonas"],
      ["in_repair", "2026-09-14T09:00:00.000Z", "usr-sarah"],
      ["ready_for_pickup", "2026-09-18T16:00:00.000Z", "usr-jonas"],
      ["completed", "2026-09-19T11:30:00.000Z", "usr-jonas"],
    ],
  ),
  defineTicket(
    {
      id: "TR-1036",
      customerId: "usr-linda",
      technicianId: null,
      deviceType: "tablet",
      deviceModel: "iPad mini (6th gen)",
      problem: "Cracked screen",
    },
    [
      ["new", "2026-10-20T10:00:00.000Z", "usr-linda"],
      ["cancelled", "2026-10-21T09:00:00.000Z", "usr-elena"],
    ],
  ),
  defineTicket(
    {
      id: "TR-1038",
      customerId: "usr-ben",
      technicianId: "usr-marco",
      deviceType: "desktop",
      deviceModel: "Custom gaming PC",
      problem: "Random restarts under load",
      diagnosis: "Failing power supply and a worn motherboard.",
      estimate: estimate(
        24000,
        "declined",
        "Too expensive for the age of the machine.",
      ),
    },
    [
      ["new", "2026-10-15T12:00:00.000Z", "usr-ben"],
      ["diagnosing", "2026-10-16T09:30:00.000Z", "usr-marco"],
      ["awaiting_approval", "2026-10-17T11:00:00.000Z", "usr-marco"],
      ["declined", "2026-10-18T08:45:00.000Z", "usr-ben"],
    ],
  ),
  defineTicket(
    {
      id: "TR-1041",
      customerId: "usr-sarah",
      technicianId: "usr-priya",
      deviceType: "phone",
      deviceModel: "iPhone 13",
      problem: "Cracked screen, display lines",
      diagnosis: "Cracked glass and a damaged display panel.",
      estimate: estimate(17900),
    },
    [
      ["new", "2026-10-22T10:20:00.000Z", "usr-sarah"],
      ["diagnosing", "2026-10-22T15:00:00.000Z", "usr-priya"],
      ["awaiting_approval", "2026-10-23T09:00:00.000Z", "usr-priya"],
      ["in_repair", "2026-10-23T13:40:00.000Z", "usr-sarah"],
      ["ready_for_pickup", "2026-10-28T15:00:00.000Z", "usr-priya"],
    ],
  ),
  defineTicket(
    {
      id: "TR-1043",
      customerId: "usr-aisha",
      technicianId: "usr-jonas",
      deviceType: "tablet",
      deviceModel: "Samsung Galaxy Tab S8",
      problem: "Screen flickers",
      diagnosis: "Loose display connector, reseated and tested.",
      estimate: estimate(15900),
    },
    [
      ["new", "2026-10-23T08:50:00.000Z", "usr-aisha"],
      ["diagnosing", "2026-10-23T14:10:00.000Z", "usr-jonas"],
      ["awaiting_approval", "2026-10-24T10:00:00.000Z", "usr-jonas"],
      ["in_repair", "2026-10-24T16:20:00.000Z", "usr-aisha"],
      ["ready_for_pickup", "2026-10-29T12:00:00.000Z", "usr-jonas"],
    ],
  ),
  defineTicket(
    {
      id: "TR-1044",
      customerId: "usr-tom",
      technicianId: "usr-jonas",
      deviceType: "game_console",
      deviceModel: "Nintendo Switch",
      problem: "Joy-Con drift",
      diagnosis: "Worn analog sticks on both controllers.",
      estimate: estimate(7500),
      expectedCompletionAt: "2026-11-06",
    },
    [
      ["new", "2026-10-24T11:30:00.000Z", "usr-tom"],
      ["diagnosing", "2026-10-25T09:00:00.000Z", "usr-jonas"],
      ["awaiting_approval", "2026-10-26T10:15:00.000Z", "usr-jonas"],
      ["awaiting_parts", "2026-10-27T08:30:00.000Z", "usr-tom"],
    ],
  ),
  defineTicket(
    {
      id: "TR-1045",
      customerId: "usr-david",
      technicianId: "usr-marco",
      deviceType: "laptop",
      deviceModel: "Lenovo ThinkPad T14",
      problem: "Fan noise and overheating",
      diagnosis: "Dust-clogged heatsink and dried thermal paste.",
      estimate: estimate(11900),
      expectedCompletionAt: "2026-11-02",
    },
    [
      ["new", "2026-10-23T16:00:00.000Z", "usr-david"],
      ["diagnosing", "2026-10-24T09:20:00.000Z", "usr-marco"],
      ["awaiting_approval", "2026-10-26T11:00:00.000Z", "usr-marco"],
      ["in_repair", "2026-10-27T13:00:00.000Z", "usr-david"],
    ],
  ),
  defineTicket(
    {
      id: "TR-1046",
      customerId: "usr-linda",
      technicianId: "usr-priya",
      deviceType: "headphones",
      deviceModel: "Sony WH-1000XM4",
      problem: "Left ear cup has no sound",
      diagnosis: "Broken driver cable in the left ear cup.",
      estimate: estimate(8900),
      expectedCompletionAt: "2026-11-02",
    },
    [
      ["new", "2026-10-24T13:15:00.000Z", "usr-linda"],
      ["diagnosing", "2026-10-26T09:00:00.000Z", "usr-priya"],
      ["awaiting_approval", "2026-10-27T10:30:00.000Z", "usr-priya"],
      ["in_repair", "2026-10-28T10:00:00.000Z", "usr-linda"],
    ],
  ),
  defineTicket(
    {
      id: "TR-1047",
      customerId: "usr-ben",
      technicianId: "usr-priya",
      deviceType: "phone",
      deviceModel: "iPhone 12",
      problem: "Back glass shattered",
      diagnosis: "Back glass only; frame and camera are fine.",
      estimate: estimate(9900, "pending"),
    },
    [
      ["new", "2026-10-27T17:00:00.000Z", "usr-ben"],
      ["diagnosing", "2026-10-28T10:10:00.000Z", "usr-priya"],
      ["awaiting_approval", "2026-10-29T09:45:00.000Z", "usr-priya"],
    ],
  ),
  defineTicket(
    {
      id: "TR-1048",
      customerId: "usr-sarah",
      technicianId: "usr-marco",
      priority: "high",
      deviceType: "laptop",
      deviceModel: "MacBook Air M1 (2020)",
      serialNumber: "C02XK0ABQ6L4",
      problem: "Liquid damage, keys unresponsive",
      diagnosis: "Corrosion on the keyboard flex and near the SSD connector.",
      estimate: estimate(28900, "pending"),
    },
    [
      ["new", "2026-10-27T11:00:00.000Z", "usr-sarah"],
      ["diagnosing", "2026-10-28T09:30:00.000Z", "usr-marco"],
      ["awaiting_approval", "2026-10-29T14:15:00.000Z", "usr-marco"],
    ],
  ),
  defineTicket(
    {
      id: "TR-1049",
      customerId: "usr-aisha",
      technicianId: "usr-marco",
      deviceType: "phone",
      deviceModel: "Google Pixel 7",
      problem: "Battery drains in a few hours",
    },
    [
      ["new", "2026-10-28T19:00:00.000Z", "usr-aisha"],
      ["diagnosing", "2026-10-29T10:00:00.000Z", "usr-marco"],
    ],
  ),
  defineTicket(
    {
      id: "TR-1050",
      customerId: "usr-tom",
      technicianId: "usr-jonas",
      deviceType: "game_console",
      deviceModel: "PlayStation 5",
      problem: "Disc drive makes a grinding noise",
    },
    [
      ["new", "2026-10-29T15:10:00.000Z", "usr-tom"],
      ["diagnosing", "2026-10-29T17:20:00.000Z", "usr-jonas"],
    ],
  ),
  defineTicket(
    {
      id: "TR-1051",
      customerId: "usr-linda",
      technicianId: null,
      deviceType: "phone",
      deviceModel: "Samsung Galaxy S22",
      problem: "Charging port loose, charges only at an angle",
    },
    [["new", "2026-10-30T07:55:00.000Z", "usr-linda"]],
  ),
  defineTicket(
    {
      id: "TR-1052",
      customerId: "usr-david",
      technicianId: null,
      priority: "urgent",
      deviceType: "laptop",
      deviceModel: "Dell XPS 15 9520",
      problem: "Won't power on, charging light blinks",
    },
    [["new", "2026-10-30T08:40:00.000Z", "usr-david"]],
  ),
];

const messages: Omit<Message, "id">[] = [
  {
    ticketId: "TR-1041",
    authorId: "usr-priya",
    kind: "message",
    body: "Your iPhone is ready. We are open Mon–Sat 9am–6pm.",
    createdAt: "2026-10-28T15:05:00.000Z",
  },
  {
    ticketId: "TR-1048",
    authorId: "usr-marco",
    kind: "internal_note",
    body: "Residue under the keyboard and corrosion near the SSD connector. Re-check after cleaning.",
    createdAt: "2026-10-28T16:00:00.000Z",
  },
  {
    ticketId: "TR-1048",
    authorId: "usr-sarah",
    kind: "message",
    body: "Is it worth repairing a 2020 MacBook Air?",
    createdAt: "2026-10-29T15:00:00.000Z",
  },
  {
    ticketId: "TR-1048",
    authorId: "usr-marco",
    kind: "message",
    body: "Yes, the logic board is repairable. The estimate is waiting for your approval.",
    createdAt: "2026-10-29T15:30:00.000Z",
  },
  {
    ticketId: "TR-1050",
    authorId: "usr-jonas",
    kind: "internal_note",
    body: "The drive belt looks worn. Test with the spare drive before quoting.",
    createdAt: "2026-10-29T17:40:00.000Z",
  },
];

const withIds = <T>(prefix: string, items: Omit<T, "id">[]) =>
  items.map((item, i) => ({ ...item, id: `${prefix}-${i + 1}` }) as T);

export const seedData: SeedData = {
  users,
  tickets: defined.map((d) => d.ticket),
  messages: withIds<Message>("msg", messages),
  statusChanges: withIds<StatusChange>(
    "chg",
    defined.flatMap((d) => d.changes),
  ),
};
