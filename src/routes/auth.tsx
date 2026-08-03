import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toEmail } from "@/lib/use-auth";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode === "signup" ? ("signup" as const) : ("login" as const),
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Employly" },
      {
        name: "description",
        content:
          "Create an Employly account or sign in to browse local makers and small businesses near you.",
      },
      { property: "og:title", content: "Sign in — Employly" },
      {
        property: "og:description",
        content: "Sign in to Employly to post your profile and send work requests.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const inputClass =
  "w-full rounded-xl border border-input bg-card px-3.5 py-3 text-base text-foreground outline-none focus:border-primary";

function AuthPage() {
  const navigate = useNavigate();
  const { mode } = useSearch({ from: "/auth" });
  const isSignup = mode === "signup";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [accountRole, setAccountRole] = useState<"seeking" | "hiring">("seeking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Makes sure the default admin account exists (admin / admin123098).
  useEffect(() => {
    void fetch("/api/public/bootstrap-admin", { method: "POST" }).catch(() => {});
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) void navigate({ to: "/" });
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const email = toEmail(identifier);

    if (isSignup) {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { name, account_role: accountRole },
        },
      });
      setBusy(false);
      if (err) return setError(err.message);
      if (!data.session)
        return setNotice(
          `We sent a verification link to ${email}. Open it in your inbox to activate your account.`,
        );
      return;
    }

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) setError(err.message);
  };

  const google = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) setError("Google sign-in failed. Please try again.");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 font-sans">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-center font-display text-3xl font-semibold text-primary">Employly</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {isSignup ? "Create your account" : "Welcome back — sign in to continue"}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          {isSignup && (
            <>
              <input
                className={inputClass}
                placeholder="Your name or business name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
                {(["seeking", "hiring"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setAccountRole(r)}
                    className={
                      "rounded-full px-3 py-2 text-sm font-semibold capitalize " +
                      (accountRole === r
                        ? "bg-primary text-primary-foreground"
                        : "text-secondary-foreground")
                    }
                  >
                    {r === "seeking" ? "Seeking" : "Hiring"}
                  </button>
                ))}
              </div>
            </>
          )}

          <input
            className={inputClass}
            placeholder={isSignup ? "Your Gmail address" : "Email or username"}
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <input
            className={inputClass}
            type="password"
            placeholder="Password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary px-5 py-3.5 text-base font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          onClick={google}
          className="mt-3 w-full rounded-full border border-border bg-card px-5 py-3.5 text-base font-semibold text-foreground"
        >
          Continue with Google
        </button>

        {error && <p className="mt-3 text-center text-sm font-medium text-destructive">{error}</p>}
        {notice && <p className="mt-3 text-center text-sm font-medium text-primary">{notice}</p>}

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {isSignup ? "Already have an account?" : "New to Employly?"}{" "}
          <button
            type="button"
            className="font-semibold text-primary underline-offset-4 hover:underline"
            onClick={() =>
              navigate({ to: "/auth", search: { mode: isSignup ? "login" : "signup" } })
            }
          >
            {isSignup ? "Sign in" : "Create an account"}
          </button>
        </p>
      </div>
    </div>
  );
}
