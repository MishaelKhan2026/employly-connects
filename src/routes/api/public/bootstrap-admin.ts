import { createFileRoute } from "@tanstack/react-router";

const ADMIN_EMAIL = "admin@employly.app";
const ADMIN_PASSWORD = "admin123098";

async function ensureAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const created = await supabaseAdmin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Employly Admin", account_role: "hiring" },
  });

  let userId = created.data.user?.id;

  if (!userId) {
    const { data } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    userId = data.users.find((u) => u.email === ADMIN_EMAIL)?.id;
  }

  if (!userId) return { ok: false as const };

  await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

  return { ok: true as const };
}

export const Route = createFileRoute("/api/public/bootstrap-admin")({
  server: {
    handlers: {
      POST: async () => {
        const result = await ensureAdmin();
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
