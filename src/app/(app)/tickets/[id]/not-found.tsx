import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function TicketNotFound() {
  return (
    <div className="mx-auto grid max-w-md gap-4 py-10 text-center">
      <h1 className="text-2xl font-semibold">Ticket not found</h1>
      <p className="text-muted-foreground">
        It may not exist, or it may belong to someone else.
      </p>
      <Button asChild className="justify-self-center">
        <Link href="/">Back to my repairs</Link>
      </Button>
    </div>
  );
}
