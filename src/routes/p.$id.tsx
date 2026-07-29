import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { SEED } from "@/lib/employly";
import { useEmployly } from "@/lib/use-employly";

export const Route = createFileRoute("/p/$id")({
  loader: ({ params }) => {
    const profile = SEED.find((p) => p.id === params.id);
    if (!profile) throw notFound();
    return { profile };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Profile unavailable — Employly" }, { name: "robots", content: "noindex" }],
      };
    }
    const { profile } = loaderData;
    const description = `${profile.name} — ${profile.skills.join(", ")}. ${profile.lookingFor}`;
    return {
      meta: [
        { title: `${profile.name} — Employly` },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:title", content: `${profile.name} — Employly` },
        { property: "og:description", content: description.slice(0, 155) },
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
      <p className="mt-1 text-sm leading-relaxed text-foreground">{value}</p>
    </div>
  );
}

function ProfileDetail() {
  const { profile } = Route.useLoaderData();
  const { store, hydrated, setRole, toggleRequest } = useEmployly();
  const requested = hydrated && store.requests.includes(profile.id);
  const isBusiness = profile.role === "hiring";

  return (
    <AppShell role={store.role} onRoleChange={setRole}>
      <Link to="/" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
        ← Back
      </Link>

      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight">{profile.name}</h1>
      <p className="text-sm text-muted-foreground">
        {isBusiness ? "Local business" : "Looking for work"} · {profile.location}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {profile.skills.map((skill) => (
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
          value={profile.about}
        />
        <Field
          label={isBusiness ? "Type of employee wanted" : "What they are looking for"}
          value={profile.lookingFor}
        />
        <Field label={isBusiness ? "Salary offered" : "Salary expectation"} value={profile.salary} />
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
    </AppShell>
  );
}
