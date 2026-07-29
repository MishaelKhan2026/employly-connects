import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { SkillTabs } from "@/components/skill-tabs";
import { emptyProfile, type Profile } from "@/lib/employly";
import { useEmployly } from "@/lib/use-employly";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My profile — Employly" },
      {
        name: "description",
        content:
          "Add your name, skills, what you are looking for and your salary — as a job seeker or as a hiring business.",
      },
      { property: "og:title", content: "My profile — Employly" },
      {
        property: "og:description",
        content: "Set up your Employly profile for hiring or for finding local work.",
      },
    ],
  }),
  component: MyProfile,
});

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-input bg-card px-3.5 py-3 text-base text-foreground outline-none focus:border-primary";

function MyProfile() {
  const { store, hydrated, setRole, setProfile } = useEmployly();
  const role = store.role;
  const [draft, setDraft] = useState<Profile>(() => emptyProfile(role));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(store.profiles[role] ?? emptyProfile(role));
    setSaved(false);
  }, [role, hydrated, store.profiles]);

  const isBusiness = role === "hiring";
  const set = (patch: Partial<Profile>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setSaved(false);
  };

  return (
    <AppShell role={role} onRoleChange={setRole}>
      <h1 className="font-display text-2xl font-semibold leading-tight">
        {isBusiness ? "Your business profile" : "Your work profile"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        You have one profile for each role. Switch the toggle above to edit the other one.
      </p>

      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setProfile({ ...draft, role, id: "me" });
          setSaved(true);
        }}
      >
        <Row label={isBusiness ? "Business name" : "Your name"}>
          <input
            className={inputClass}
            value={draft.name}
            maxLength={80}
            onChange={(e) => set({ name: e.target.value })}
            placeholder={isBusiness ? "Sunrise Corner Bakery" : "Amara Diallo"}
          />
        </Row>

        <Row label="Area / neighbourhood">
          <input
            className={inputClass}
            value={draft.location}
            maxLength={80}
            onChange={(e) => set({ location: e.target.value })}
            placeholder="Old Town"
          />
        </Row>

        <div>
          <p className="text-sm font-semibold text-foreground">
            {isBusiness ? "Skills you need" : "Your talents & skills"}
          </p>
          <div className="mt-2">
            <SkillTabs
              selected={draft.skills}
              onToggle={(skill) =>
                set({
                  skills: draft.skills.includes(skill)
                    ? draft.skills.filter((s) => s !== skill)
                    : [...draft.skills, skill],
                })
              }
              onClear={() => set({ skills: [] })}
            />
          </div>
        </div>

        <Row
          label={isBusiness ? "About your business & requirements" : "Your interests & experience"}
        >
          <textarea
            className={inputClass + " min-h-28"}
            value={draft.about}
            maxLength={600}
            onChange={(e) => set({ about: e.target.value })}
          />
        </Row>

        <Row label={isBusiness ? "Type of employee you want" : "What you are looking for"}>
          <textarea
            className={inputClass + " min-h-24"}
            value={draft.lookingFor}
            maxLength={600}
            onChange={(e) => set({ lookingFor: e.target.value })}
          />
        </Row>

        <Row
          label={isBusiness ? "Salary you can pay" : "Your salary expectation"}
          hint="For example: $12 / hour or $250 / month"
        >
          <input
            className={inputClass}
            value={draft.salary}
            maxLength={60}
            onChange={(e) => set({ salary: e.target.value })}
          />
        </Row>

        <button
          type="submit"
          className="w-full rounded-full bg-primary px-5 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Save profile
        </button>
        {saved && (
          <p className="text-center text-sm font-medium text-primary">Saved on this device.</p>
        )}
      </form>
    </AppShell>
  );
}
