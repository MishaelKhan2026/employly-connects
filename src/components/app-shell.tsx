import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { Role } from "@/lib/employly";

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
              to="/profile"
              className="rounded-full border border-primary-foreground/40 px-3 py-1.5 text-sm font-medium"
              activeProps={{ className: "bg-primary-foreground/15" }}
            >
              My profile
            </Link>
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
