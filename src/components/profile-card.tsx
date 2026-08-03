import { Link } from "@tanstack/react-router";
import type { Profile } from "@/lib/employly";
import { useAuth } from "@/lib/use-auth";

export function ProfileCard({ profile, requested }: { profile: Profile; requested: boolean }) {
  const { isAdmin } = useAuth();

  return (
    <Link
      to="/p/$id"
      params={{ id: profile.id }}
      className="block rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold leading-tight">{profile.name}</h3>
          <p className="text-sm text-muted-foreground">{profile.location}</p>
        </div>
        {requested && (
          <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            Requested
          </span>
        )}
      </div>

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

      <p className="mt-3 line-clamp-2 text-sm text-foreground/80">{profile.lookingFor}</p>
      {isAdmin ? (
        <p className="mt-2 text-sm font-semibold text-primary">{profile.salary}</p>
      ) : (
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          Amount visible to admins only
        </p>
      )}
    </Link>
  );
}
