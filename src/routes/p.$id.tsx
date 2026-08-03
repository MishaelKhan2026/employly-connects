import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { SEED, type Profile } from "@/lib/employly";
import { supabase } from "@/integrations/supabase/client";
import { useEmployly } from "@/lib/use-employly";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/p/$id")({
  loader: ({ params }) => ({ seed: SEED.find((p) => p.id === params.id) ?? null }),
  head: ({ loaderData }) => {
    const profile = loaderData?.seed;
    if (!profile) {
      return {
        meta: [
          { title: "Public profile — Employly" },
          {
            name: "description",
            content: "View a public Employly profile: skills, experience and what they are looking for.",
          },
          { property: "og:title", content: "Public profile — Employly" },
          {
            property: "og:description",
            content: "Skills, experience and availability on Employly.",
          },
          { property: "og:type", content: "profile" },
          { name: "twitter:card", content: "summary" },
        ],
      };
    }
    const description = `${profile.name} — ${profile.skills.join(", ")}. ${profile.lookingFor}`;
    return {
      meta: [
        { title: `${profile.name} — Employly` },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:title", content: `${profile.name} — Employly` },
        { property: "og:description", content: description.slice(0, 155) },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: ProfileDetail,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-6 text-center text-sm text-muted-foreground">Profile not found.</div>
  ),
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-foreground">{value}</p>
    </div>
  );
}

function ProfileDetail() {
  const { seed } = Route.useLoaderData();
  const { id } = Route.useParams();
  const { store, hydrated, setRole, toggleRequest } = useEmployly();
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(seed);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (seed) return;
    let active = true;
    void supabase
      .from("profiles")
      .select("id, name, account_role, location, country, city, street, skills, about, looking_for")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        if (!data) return setMissing(true);
        setProfile({
          id: data.id,
          role: data.account_role === "hiring" ? "hiring" : "seeking",
          name: data.name || "Employly member",
          location: data.street || data.location || "",
          country: data.country ?? "",
          city: data.city ?? "",
          street: data.street ?? "",
          skills: data.skills ?? [],
          about: data.about ?? "",
          lookingFor: data.looking_for ?? "",
          salary: "",
        });
      });
    return () => {
      active = false;
    };
  }, [id, seed]);

  if (missing) {
    return (
      <AppShell role={store.role} onRoleChange={setRole}>
        <p className="p-6 text-center text-sm text-muted-foreground">Profile not found.</p>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell role={store.role} onRoleChange={setRole}>
        <p className="p-6 text-center text-sm text-muted-foreground">Loading profile…</p>
      </AppShell>
    );
  }

  const requested = hydrated && store.requests.includes(profile.id);
  const isBusiness = profile.role === "hiring";
  const canMessage = !seed && profile.id !== user?.id;
  const place = [profile.street || profile.location, profile.city, profile.country]
    .filter(Boolean)
    .join(", ");

  return (
    <AppShell role={store.role} onRoleChange={setRole}>
      <Link to="/" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
        ← Back
      </Link>

      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight">{profile.name}</h1>
      <p className="text-sm text-muted-foreground">
        {isBusiness ? "Local business" : "Looking for work"}
        {place && ` · ${place}`}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {profile.skills.map((skill: string) => (
          <span
            key={skill}
            className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        <Field
          label={isBusiness ? "About the business & requirements" : "Interests & experience"}
          value={profile.about || "Not added yet."}
        />
        <Field
          label={isBusiness ? "Type of employee wanted" : "What they are looking for"}
          value={profile.lookingFor || "Not added yet."}
        />
        <Field
          label={isBusiness ? "Salary offered" : "Salary expectation"}
          value={isAdmin ? profile.salary || "Not added yet." : "Visible to admins only"}
        />
      </div>

      <button
        type="button"
        onClick={() => toggleRequest(profile.id)}
        className={
          "mt-6 w-full rounded-full px-5 py-3.5 text-base font-semibold transition-colors " +
          (requested
            ? "border border-primary bg-background text-primary"
            : "bg-primary text-primary-foreground hover:bg-primary/90")
        }
      >
        {requested
          ? "Request sent — tap to cancel"
          : isBusiness
            ? "Request employment here"
            : "Request them to join your business"}
      </button>

      {canMessage && (
        <button
          type="button"
          onClick={() => void navigate({ to: "/messages", search: { with: profile.id } })}
          className="mt-3 w-full rounded-full border border-border bg-card px-5 py-3.5 text-base font-semibold text-foreground"
        >
          Message
        </button>
      )}
    </AppShell>
  );
}
