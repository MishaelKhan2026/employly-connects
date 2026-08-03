import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { COUNTRIES, citiesOf, streetsOf } from "@/lib/locations";
import type { Role } from "@/lib/employly";
import { useAccount } from "@/lib/use-account";
import { useAuth } from "@/lib/use-auth";
import { useEmployly } from "@/lib/use-employly";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Choose your role and area — Employly" },
      {
        name: "description",
        content:
          "Pick whether you are seeking work or hiring, then set your country, city and street so Employly can show you people and jobs nearby.",
      },
      { property: "og:title", content: "Choose your role and area — Employly" },
      {
        property: "og:description",
        content: "Set your role and location to see nearby jobs and candidates on Employly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const selectClass =
  "w-full rounded-xl border border-input bg-card px-3.5 py-3 text-base text-foreground outline-none focus:border-primary";

function Onboarding() {
  const navigate = useNavigate();
  const { session, loading: authLoading, user } = useAuth();
  const { account, loading, save } = useAccount();
  const { setRole } = useEmployly();

  const [role, setLocalRole] = useState<Role>("seeking");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) void navigate({ to: "/auth", search: { mode: "login" } });
  }, [authLoading, session, navigate]);

  useEffect(() => {
    if (!account) return;
    setLocalRole(account.role);
    setCountry(account.country);
    setCity(account.city);
    setStreet(account.street);
  }, [account]);

  const ready = country && city && street;

  const submit = async () => {
    if (!ready) return;
    setBusy(true);
    await save({
      role,
      country,
      city,
      street,
      onboarded: true,
      name: account?.name || (user?.email?.split("@")[0] ?? ""),
    });
    setRole(role);
    setBusy(false);
    void navigate({ to: "/" });
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 font-sans">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-center font-display text-3xl font-semibold text-primary">
          Welcome to Employly
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Two quick steps and we will show you what is close to you.
        </p>

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-foreground">1. Choose your role</h2>
          <div className="mt-2 grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
            {(["seeking", "hiring"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setLocalRole(r)}
                aria-pressed={role === r}
                className={
                  "rounded-full px-3 py-2.5 text-sm font-semibold " +
                  (role === r
                    ? "bg-primary text-primary-foreground"
                    : "text-secondary-foreground")
                }
              >
                {r === "seeking" ? "Seeking" : "Hiring"}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {role === "seeking"
              ? "You will see job listings from local businesses near you."
              : "You will see candidate profiles from people near you."}
          </p>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">2. Where are you?</h2>
          <select
            className={selectClass}
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setCity("");
              setStreet("");
            }}
            aria-label="Country"
          >
            <option value="">Select country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={city}
            disabled={!country}
            onChange={(e) => {
              setCity(e.target.value);
              setStreet("");
            }}
            aria-label="City"
          >
            <option value="">Select city</option>
            {citiesOf(country).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={street}
            disabled={!city}
            onChange={(e) => setStreet(e.target.value)}
            aria-label="Street"
          >
            <option value="">Select street</option>
            {streetsOf(country, city).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </section>

        <button
          type="button"
          onClick={() => void submit()}
          disabled={!ready || busy}
          className="mt-6 w-full rounded-full bg-primary px-5 py-3.5 text-base font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Saving…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
