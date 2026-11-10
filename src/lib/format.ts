const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const date = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

const dateTime = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export const formatMoney = (cents: number) => money.format(cents / 100);

export const formatDate = (iso: string) => date.format(new Date(iso));

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
