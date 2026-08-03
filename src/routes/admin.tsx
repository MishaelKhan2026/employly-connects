import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { deleteAccount, listAccounts, setAccountStatus } from "@/lib/admin.functions";
import { useAuth } from "@/lib/use-auth";
import { useEmployly } from "@/lib/use-employly";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Employly" },
      {
        name: "description",
        content:
          "Employly admin area: review every account, see salary amounts and contact details, mark accounts as hired or remove them.",
      },
      { property: "og:title", content: "Admin — Employly" },
      { property: "og:description", content: "Manage Employly accounts and permissions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { store, setRole } = useEmployly();
  const { isAdmin, loading, session } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fetchAccounts = useServerFn(listAccounts);
  const remove = useServerFn(deleteAccount);
  const setStatus = useServerFn(setAccountStatus);

  const accounts = useQuery({
    queryKey: ["admin-accounts"],
    queryFn: () => fetchAccounts(),
    enabled: Boolean(session) && isAdmin,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
  const removeMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: invalidate,
  });
  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: "active" | "hired" }) => setStatus({ data: vars }),
    onSuccess: invalidate,
  });

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/auth", search: { mode: "login" } });
  }, [loading, session, navigate]);

  return (
    <AppShell role={store.role} onRoleChange={setRole}>
      <h1 className="font-display text-2xl font-semibold leading-tight">Admin</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Full account data, including salary amounts, is visible to admins only.
      </p>

      {!loading && !isAdmin && (
        <p className="mt-6 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          You do not have admin permission.
        </p>
      )}

      {isAdmin && (
        <div className="mt-5 space-y-3">
          {accounts.isLoading && <p className="text-sm text-muted-foreground">Loading accounts…</p>}
          {accounts.error && (
            <p className="text-sm text-destructive">{(accounts.error as Error).message}</p>
          )}
          {accounts.data?.map((a) => (
            <article key={a.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold leading-tight">
                    {a.name || "(no name)"}
                  </h2>
                  <p className="text-sm text-muted-foreground">{a.email}</p>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold capitalize text-secondary-foreground">
                  {a.is_admin ? "admin" : a.account_role}
                </span>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">Amount</dt>
                  <dd className="font-semibold text-primary">{a.salary || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">Area</dt>
                  <dd>{a.location || "—"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs uppercase text-muted-foreground">Skills</dt>
                  <dd>{a.skills.join(", ") || "—"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs uppercase text-muted-foreground">Looking for</dt>
                  <dd>{a.looking_for || "—"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs uppercase text-muted-foreground">Status</dt>
                  <dd className="capitalize">{a.status}</dd>
                </div>
              </dl>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    statusMutation.mutate({
                      id: a.id,
                      status: a.status === "hired" ? "active" : "hired",
                    })
                  }
                  className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  {a.status === "hired" ? "Mark as active" : "Hire"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete ${a.name || a.email}? This cannot be undone.`))
                      removeMutation.mutate(a.id);
                  }}
                  className="flex-1 rounded-full border border-destructive px-4 py-2.5 text-sm font-semibold text-destructive"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
          {accounts.data?.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No accounts yet.
            </p>
          )}
        </div>
      )}
    </AppShell>
  );
}
