import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import type { Role } from "@/lib/employly";
import { useAuth } from "@/lib/use-auth";
import { useAccount } from "@/lib/use-account";

export function AppShell({
  role,
  onRoleChange,
  children,
}: {
  role: Role;
  onRoleChange: (role: Role) => void;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { session, loading, isAdmin, signOut } = useAuth();
  const { account, loading: accountLoading } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/auth", search: { mode: "login" } });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (loading || accountLoading || !session) return;
    if (!account?.onboarded) void navigate({ to: "/onboarding" });
  }, [loading, accountLoading, session, account?.onboarded, navigate]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="sticky top-0 z-20 border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-display text-2xl font-semibold tracking-tight">
            Employly
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              to="/inbox"
              className="rounded-full border border-primary-foreground/40 px-3 py-1.5 text-sm font-medium"
              activeProps={{ className: "bg-primary-foreground/15" }}
            >
              Inbox
            </Link>
            <Link
              to="/messages"
              search={{}}
              className="rounded-full border border-primary-foreground/40 px-3 py-1.5 text-sm font-medium"
              activeProps={{ className: "bg-primary-foreground/15" }}
            >
              Chat
            </Link>
            <Link
              to="/profile"
              className="rounded-full border border-primary-foreground/40 px-3 py-1.5 text-sm font-medium"
              activeProps={{ className: "bg-primary-foreground/15" }}
            >
              My profile
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="rounded-full border border-primary-foreground/40 px-3 py-1.5 text-sm font-medium"
                activeProps={{ className: "bg-primary-foreground/15" }}
              >
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-full border border-primary-foreground/40 px-3 py-1.5 text-sm font-medium"
            >
              Sign out
            </button>
          </nav>
        </div>
        <div className="mx-auto max-w-2xl px-4 pb-3">
          <RoleSwitch role={role} onChange={onRoleChange} />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16 pt-5" key={pathname}>
        {children}
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Employly — local work, local people.
      </footer>
    </div>
  );
}

export function RoleSwitch({
  role,
  onChange,
}: {
  role: Role;
  onChange: (role: Role) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-full bg-primary-foreground/15 p-1">
      {(["seeking", "hiring"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={role === option}
          className={
            "rounded-full px-3 py-2 text-sm font-semibold capitalize transition-colors " +
            (role === option
              ? "bg-background text-foreground"
              : "text-primary-foreground/80")
          }
        >
          {option === "seeking" ? "Seeking" : "Hiring"}
        </button>
      ))}
    </div>
  );
}
