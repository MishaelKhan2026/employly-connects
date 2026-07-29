import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ProfileCard } from "@/components/profile-card";
import { SkillTabs } from "@/components/skill-tabs";
import { SEED } from "@/lib/employly";
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
          "Browse local makers or local businesses by skill, then request to work together.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { store, hydrated, setRole, toggleRequest } = useEmployly();
  const [selected, setSelected] = useState<string[]>([]);

  const role = store.role;
  // Hiring people browse job seekers; seekers browse businesses.
  const targetRole = role === "hiring" ? "seeking" : "hiring";

  const results = SEED.filter(
    (p) =>
      p.role === targetRole &&
      (selected.length === 0 || p.skills.some((s) => selected.includes(s))),
  );

  const toggle = (skill: string) =>
    setSelected((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );

  return (
    <AppShell role={role} onRoleChange={setRole}>
      <h1 className="font-display text-2xl font-semibold leading-tight">
        {role === "hiring" ? "Find people to hire" : "Find a business to work with"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tap one or more skills to filter. Tap a card to see the full profile.
      </p>

      <div className="mt-4">
        <SkillTabs selected={selected} onToggle={toggle} onClear={() => setSelected([])} />
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {results.length} {targetRole === "seeking" ? "people" : "businesses"}
      </p>

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
            No matches for those skills yet. Try removing a tab.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => results.forEach((p) => !store.requests.includes(p.id) && toggleRequest(p.id))}
        className="sr-only"
        aria-hidden
        tabIndex={-1}
      />
    </AppShell>
  );
}
