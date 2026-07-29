import { useCallback, useEffect, useState } from "react";
import {
  defaultStore,
  loadStore,
  saveStore,
  type Profile,
  type Role,
  type Store,
} from "./employly";

export function useEmployly() {
  const [store, setStore] = useState<Store>(defaultStore);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStore(loadStore());
    setHydrated(true);
  }, []);

  const update = useCallback((next: (s: Store) => Store) => {
    setStore((prev) => {
      const value = next(prev);
      saveStore(value);
      return value;
    });
  }, []);

  const setRole = useCallback(
    (role: Role) => update((s) => ({ ...s, role })),
    [update],
  );

  const setProfile = useCallback(
    (profile: Profile) =>
      update((s) => ({
        ...s,
        profiles: { ...s.profiles, [profile.role]: profile },
      })),
    [update],
  );

  const toggleRequest = useCallback(
    (id: string) =>
      update((s) => ({
        ...s,
        requests: s.requests.includes(id)
          ? s.requests.filter((r) => r !== id)
          : [...s.requests, id],
      })),
    [update],
  );

  return { store, hydrated, setRole, setProfile, toggleRequest };
}
