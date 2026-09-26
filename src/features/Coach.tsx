import { useEffect, useRef, useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import type { PlayerProfile } from "../types";
import { coachingEngine } from "../lib/coaching";
import { buildContext } from "../lib/recommendations";
import { PageHeading } from "../components/UI";
import { sportNames, topicNames } from "../data/knowledge";
const prompts = [
  "My dinks keep popping up.",
  "What is a third-shot drop in tennis terms?",
  "How should I think about the kitchen?",
  "How much of my tennis volley should I keep?",
  "Why shouldn’t I attack every short ball?",
  "How is doubles positioning different?",
];
export function Coach({
  profile: p,
  onSave,
}: {
  profile: PlayerProfile;
  onSave: (p: PlayerProfile) => void;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const context = buildContext(p);
  useEffect(() => {
    if (p.chat.length) end.current?.scrollIntoView({ block: "nearest" });
  }, [p.chat.length]);
  async function send(text: string) {
    if (!text.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await coachingEngine.respond(text.trim(), context);
      onSave({
        ...p,
        chat: [
          ...p.chat,
          { role: "user" as const, text: text.trim() },
          { role: "coach" as const, text: response.text },
        ].slice(-100),
      });
      setMessage("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not save this conversation. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        kicker="TRANSLATE MY GAME"
        title="A coach that knows your starting point."
        description="Connect a familiar game to your next pickleball breakthrough."
      />
      <div className="coach-layout">
        <section className="chat-panel">
          <header className="chat-header">
            <span className="coach-avatar">
              <MessageCircle size={22} />
            </span>
            <div>
              <strong>PickleBridge Coach</strong>
              <small>Local coaching guide · no AI connection required</small>
            </div>
          </header>
          <div className="chat-messages" aria-live="polite">
            {!p.chat.length && (
              <div className="coach-welcome">
                <h2>What's happening on court?</h2>
                <p>
                  Tell me which shot is giving you trouble. I'll suggest a
                  likely cause, a familiar analogy, and one drill to test.
                </p>
                <div className="prompt-list">
                  {prompts
                    .filter(
                      (x) =>
                        p.assessment.sport === "tennis" ||
                        !x.includes("tennis"),
                    )
                    .map((x) => (
                      <button key={x} disabled={busy} onClick={() => send(x)}>
                        {x}
                        <span aria-hidden="true">↗</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
            {p.chat.map((m, i) => (
              <article key={i} className={`message ${m.role}`}>
                <span className="eyebrow">
                  {m.role === "user" ? "YOU" : "COACH"}
                </span>
                <p>{m.text}</p>
              </article>
            ))}
            <div ref={end} />
          </div>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <form
            className="chat-composer"
            onSubmit={(e) => {
              e.preventDefault();
              send(message);
            }}
          >
            <label className="sr-only" htmlFor="coach-message">
              Message your coach
            </label>
            <textarea
              id="coach-message"
              rows={2}
              maxLength={1500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="My drops keep going into the net…"
            />
            <button
              type="submit"
              className="primary"
              disabled={busy || !message.trim()}
              aria-label="Send message"
            >
              <Send size={19} />
            </button>
          </form>
          <p className="chat-note">
            Practical suggestions from deterministic rules. The coach cannot see
            your technique and does not record issues automatically.
          </p>
        </section>
        <aside className="coach-context">
          <span className="eyebrow">YOUR COACHING CONTEXT</span>
          <h3>{sportNames[p.assessment.sport]} → pickleball</h3>
          <p className="muted">
            {p.assessment.years} years of background experience ·{" "}
            {p.assessment.level.replace("-", " ")} in pickleball
          </p>
          <h4>Current focus</h4>
          {context.priorities.slice(0, 3).map((x) => (
            <p key={x.topic}>{topicNames[x.topic]}</p>
          ))}
          <h4>Recent patterns</h4>
          {context.issues.length ? (
            context.issues.slice(0, 3).map((x) => (
              <p key={x.id}>
                {x.label}
                <small className="muted"> · {x.status}</small>
              </p>
            ))
          ) : (
            <p className="muted">No active observations yet.</p>
          )}
          <div className="notice">
            Your profile, goals, habits and last five sessions inform each
            response.
          </div>
        </aside>
      </div>
    </>
  );
}
