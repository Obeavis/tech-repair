import { Suspense } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { requireUser } from "@/server/auth/current-user";

async function Shell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">
        {children}
      </main>
    </>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
