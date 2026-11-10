import { ROLE_LABELS } from "@/domain/actor";
import { requireUser } from "@/server/auth/current-user";

export default async function Home() {
  const user = await requireUser();

  return (
    <div className="grid gap-1">
      <h1 className="text-2xl font-semibold">
        Welcome, {user.name.split(" ")[0]}
      </h1>
      <p className="text-muted-foreground">
        You are signed in as {ROLE_LABELS[user.role].toLowerCase()}. The screens
        for your role are coming next.
      </p>
    </div>
  );
}
