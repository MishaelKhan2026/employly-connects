import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { INCOMING, SEED, type InboxStatus } from "@/lib/employly";
import { useEmployly } from "@/lib/use-employly";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox — Employly" },
      {
        name: "description",
        content:
          "See who sent you a request on Employly — local businesses inviting you to work, or people asking to join your team.",
      },
      { property: "og:title", content: "Inbox — Employly" },
      {
        property: "og:description",
        content: "Read and answer the work requests people sent you on Employly.",
      },
    ],
  }),
  component: Inbox,
});

function Inbox() {
  const { store, hydrated, setRole, setInboxStatus } = useEmployly();
  const role = store.role;
  const items = INCOMING[role];

  return (
    <AppShell role={role} onRoleChange={setRole}>
      <h1 className="font-display text-2xl font-semibold leading-tight">Inbox</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {role === "hiring"
          ? "People asking to work in your business."
          : "Businesses inviting you to work with them."}
      </p>

      <div className="mt-5 space-y-3">
        {items.map((item) => {
          const sender = SEED.find((p) => p.id === item.fromId);
          if (!sender) return null;
          const status = hydrated ? store.inbox?.[item.fromId] : undefined;

          return (
            <article
              key={item.fromId}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    to="/p/$id"
                    params={{ id: sender.id }}
                    className="font-display text-lg font-semibold leading-tight underline-offset-4 hover:underline"
                  >
                    {sender.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {sender.location} · {item.sentAt}
                  </p>
                </div>
                {status && <StatusBadge status={status} />}
              </div>

              <p className="mt-3 text-sm leading-relaxed text-foreground/85">“{item.message}”</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {sender.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                {status ? (
                  <button
                    type="button"
                    onClick={() => setInboxStatus(item.fromId, null)}
                    className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground"
                  >
                    Undo
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setInboxStatus(item.fromId, "accepted")}
                      className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => setInboxStatus(item.fromId, "declined")}
                      className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground"
                    >
                      Decline
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}

        {items.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No requests yet.
          </p>
        )}
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: InboxStatus }) {
  return (
    <span
      className={
        "rounded-full px-2.5 py-1 text-xs font-semibold " +
        (status === "accepted"
          ? "bg-accent text-accent-foreground"
          : "bg-muted text-muted-foreground")
      }
    >
      {status === "accepted" ? "Accepted" : "Declined"}
    </span>
  );
}
