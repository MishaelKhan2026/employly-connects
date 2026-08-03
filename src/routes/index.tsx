import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ProfileCard } from "@/components/profile-card";
import { SkillTabs } from "@/components/skill-tabs";
import { SEED, type Profile } from "@/lib/employly";
import { inferGeo } from "@/lib/locations";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/lib/use-account";
import { useEmployly } from "@/lib/use-employly";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Employly — Local hiring for handmade skills" },
      {
        name: "description",
        content:
          "Employly connects small local businesses with people who craft, bake, draw and make. Pick your skills and send a request.",
      },
      { property: "og:title", content: "Employly — Local hiring for handmade skills" },
      {
        property: "og:description",
        content:
          "Browse nearby job listings or nearby candidates by skill, then message them directly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const withGeo = (p: Profile): Profile =>
  p.city ? p : { ...p, ...inferGeo(p.location) };

function Index() {
  const { store, hydrated, setRole } = useEmployly();
  const { account } = useAccount();
  const [selected, setSelected] = useState<string[]>([]);
  const [nearbyOnly, setNearbyOnly] = useState(true);
  const [remote, setRemote] = useState<Profile[]>([]);

  const role = account?.onboarded ? account.role : store.role;
  // Hiring people browse job seekers; seekers browse job listings from businesses.
  const targetRole = role === "hiring" ? "seeking" : "hiring";

  useEffect(() => {
    let active = true;
    void supabase
      .from("profiles")
      .select("id, name, account_role, location, city, country, street, skills, about, looking_for")
      .eq("account_role", targetRole)
      .eq("onboarded", true)
      .then(({ data }) => {
        if (!active) return;
        setRemote(
          (data ?? [])
            .filter((r) => r.id !== account?.id)
            .map((r) => ({
              id: r.id,
              role: targetRole,
              name: r.name || "Employly member",
              location: r.street || r.location || "",
              country: r.country ?? "",
              city: r.city ?? "",
              street: r.street ?? "",
              skills: r.skills ?? [],
              about: r.about ?? "",
              lookingFor: r.looking_for ?? "",
              salary: "",
            })),
        );
      });
    return () => {
      active = false;
    };
  }, [targetRole, account?.id]);

  const all = [...remote, ...SEED.filter((p) => p.role === targetRole).map(withGeo)];

  const results = all
    .filter((p) => selected.length === 0 || p.skills.some((s) => selected.includes(s)))
    .filter((p) => !nearbyOnly || !account?.city || p.city === account.city)
    .sort((a, b) => Number(b.street === account?.street) - Number(a.street === account?.street));

  const toggle = (skill: string) =>
    setSelected((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );

  return (
    <AppShell role={role} onRoleChange={setRole}>
      <h1 className="font-display text-2xl font-semibold leading-tight">
        {role === "hiring" ? "Candidates near you" : "Job listings near you"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {account?.city
          ? `Showing ${nearbyOnly ? account.city : "every area"} · your street: ${account.street}`
          : "Tap one or more skills to filter. Tap a card to see the full profile."}
      </p>

      <div className="mt-4">
        <SkillTabs selected={selected} onToggle={toggle} onClear={() => setSelected([])} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {results.length} {targetRole === "seeking" ? "candidates" : "listings"}
        </p>
        {account?.city && (
          <button
            type="button"
            onClick={() => setNearbyOnly((v) => !v)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold"
          >
            {nearbyOnly ? "Show all areas" : `Only ${account.city}`}
          </button>
        )}
      </div>

      <div className="mt-2 space-y-3">
        {results.map((p) => (
          <ProfileCard
            key={p.id}
            profile={p}
            requested={hydrated && store.requests.includes(p.id)}
          />
        ))}
        {results.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nothing here yet. Try removing a skill tab or showing all areas.
          </p>
        )}
      </div>
    </AppShell>
  );
}
