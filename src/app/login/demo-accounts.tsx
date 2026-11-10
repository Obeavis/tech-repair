import { connection } from "next/server";

import { demoSignInAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, ROLES } from "@/domain/actor";
import { getRepository } from "@/server/repository";

export async function DemoAccounts() {
  await connection();
  const users = await getRepository().users.list();
  const accounts = ROLES.flatMap(
    (role) => users.find((u) => u.role === role) ?? [],
  );

  return (
    <section aria-labelledby="demo-accounts" className="grid gap-3">
      <h2 id="demo-accounts" className="text-sm font-medium">
        Demo accounts
      </h2>
      <p className="text-sm text-muted-foreground">
        This is a prototype: any password works.
      </p>
      <div className="grid gap-2">
        {accounts.map((user) => (
          <form key={user.id} action={demoSignInAction}>
            <input type="hidden" name="email" value={user.email} />
            <input type="hidden" name="password" value="demo" />
            <Button
              type="submit"
              variant="outline"
              className="w-full justify-between"
            >
              <span>{user.name}</span>
              <span className="text-muted-foreground">
                {ROLE_LABELS[user.role]}
              </span>
            </Button>
          </form>
        ))}
      </div>
    </section>
  );
}
