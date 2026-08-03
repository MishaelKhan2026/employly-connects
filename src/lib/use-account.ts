import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Role } from "./employly";
import { useAuth } from "./use-auth";

export type Account = {
  id: string;
  name: string;
  role: Role;
  country: string;
  city: string;
  street: string;
  onboarded: boolean;
};

/** The signed-in user's own profile row (role + location), loaded from the backend. */
export function useAccount() {
  const { user } = useAuth();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, name, account_role, country, city, street, onboarded")
      .eq("id", userId)
      .maybeSingle();
    setAccount(
      data
        ? {
            id: data.id,
            name: data.name ?? "",
            role: (data.account_role === "hiring" ? "hiring" : "seeking") as Role,
            country: data.country ?? "",
            city: data.city ?? "",
            street: data.street ?? "",
            onboarded: Boolean(data.onboarded),
          }
        : null,
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setAccount(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    void load(user.id);
  }, [user?.id, load]);

  const save = useCallback(
    async (patch: Partial<Omit<Account, "id">>) => {
      if (!user?.id) return;
      const next = {
        id: user.id,
        name: patch.name ?? account?.name ?? "",
        account_role: patch.role ?? account?.role ?? "seeking",
        country: patch.country ?? account?.country ?? "",
        city: patch.city ?? account?.city ?? "",
        street: patch.street ?? account?.street ?? "",
        onboarded: patch.onboarded ?? account?.onboarded ?? false,
      };
      await supabase.from("profiles").upsert(next);
      await load(user.id);
    },
    [user?.id, account, load],
  );

  return { account, loading, save, reload: () => user?.id && load(user.id) };
}
