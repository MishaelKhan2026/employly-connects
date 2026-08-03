import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { useEmployly } from "@/lib/use-employly";

export const Route = createFileRoute("/messages")({
  validateSearch: (search: Record<string, unknown>) => ({
    with: typeof search.with === "string" ? search.with : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Messages — Employly" },
      {
        name: "description",
        content:
          "Chat directly with local businesses and job seekers you have matched with on Employly.",
      },
      { property: "og:title", content: "Messages — Employly" },
      {
        property: "og:description",
        content: "In-app messaging between local businesses and job seekers on Employly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Messages,
});

type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
};

function Messages() {
  const { store, setRole } = useEmployly();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { with: partnerId } = useSearch({ from: "/messages" });

  const [messages, setMessages] = useState<Message[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const bottom = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, recipient_id, body, created_at")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: true });
    const rows = (data ?? []) as Message[];
    setMessages(rows);

    const ids = Array.from(
      new Set(
        rows
          .flatMap((m) => [m.sender_id, m.recipient_id])
          .concat(partnerId ? [partnerId] : [])
          .filter((id) => id !== user.id),
      ),
    );
    if (ids.length) {
      const { data: people } = await supabase.from("profiles").select("id, name").in("id", ids);
      setNames(
        Object.fromEntries((people ?? []).map((p) => [p.id, p.name || "Employly member"])),
      );
    }
    setLoading(false);
  }, [user?.id, partnerId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel("messages-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id, load]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages.length, partnerId]);

  const partners = Array.from(
    new Set(
      messages.map((m) => (m.sender_id === user?.id ? m.recipient_id : m.sender_id)),
    ),
  );

  const thread = partnerId
    ? messages.filter((m) => m.sender_id === partnerId || m.recipient_id === partnerId)
    : [];

  const send = async () => {
    const body = draft.trim();
    if (!body || !partnerId || !user?.id) return;
    setDraft("");
    await supabase
      .from("messages")
      .insert({ sender_id: user.id, recipient_id: partnerId, body });
    await load();
  };

  return (
    <AppShell role={store.role} onRoleChange={setRole}>
      {partnerId ? (
        <>
          <button
            type="button"
            onClick={() => void navigate({ to: "/messages", search: {} })}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            ← All conversations
          </button>
          <h1 className="mt-2 font-display text-2xl font-semibold leading-tight">
            {names[partnerId] ?? "Conversation"}
          </h1>

          <div className="mt-4 space-y-2">
            {thread.map((m) => {
              const mine = m.sender_id === user?.id;
              return (
                <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                  <p
                    className={
                      "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm " +
                      (mine
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-foreground border border-border")
                    }
                  >
                    {m.body}
                  </p>
                </div>
              );
            })}
            {thread.length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No messages yet — say hello.
              </p>
            )}
            <div ref={bottom} />
          </div>

          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <input
              className="flex-1 rounded-full border border-input bg-card px-4 py-3 text-base outline-none focus:border-primary"
              value={draft}
              maxLength={800}
              placeholder="Write a message"
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Send
            </button>
          </form>
        </>
      ) : (
        <>
          <h1 className="font-display text-2xl font-semibold leading-tight">Messages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chats with people and businesses you have contacted.
          </p>
          <div className="mt-4 space-y-2">
            {partners.map((id) => {
              const last = [...messages]
                .reverse()
                .find((m) => m.sender_id === id || m.recipient_id === id);
              return (
                <Link
                  key={id}
                  to="/messages"
                  search={{ with: id }}
                  className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <p className="font-semibold">{names[id] ?? "Employly member"}</p>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{last?.body}</p>
                </Link>
              );
            })}
            {!loading && partners.length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No conversations yet. Open a profile and tap “Message” to start one.
              </p>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
