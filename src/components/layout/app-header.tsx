import { signOutAction } from "@/app/login/actions";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/domain/actor";
import type { User } from "@/domain/user";

export function AppHeader({ user }: { user: User }) {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6">
        <span className="font-semibold">Tech Repair</span>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm leading-tight">
            <p className="font-medium">{user.name}</p>
            <p className="text-muted-foreground">{ROLE_LABELS[user.role]}</p>
          </div>
          <ThemeToggle />
          <form action={signOutAction}>
            <Button type="submit" variant="ghost">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
