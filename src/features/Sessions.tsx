import { useState } from "react";
import { Plus, CalendarDays } from "lucide-react";
import type { PlayerProfile, Session } from "../types";
import { problemCatalog } from "../data/knowledge";
import { localDate, issueLabel } from "../lib/recommendations";
import { Empty, PageHeading } from "../components/UI";
export function SessionForm({
  onSave,
  onCancel,
}: {
  onSave: (s: Session) => void;
  onCancel: () => void;
}) {
  const [s, setS] = useState<Session>({
    id: crypto.randomUUID(),
    date: localDate(),
    duration: 60,
    kind: "games",
    format: "doubles",
    good: "",
    issues: [],
    notes: "",
    rating: 3,
  });
  const [custom, setCustom] = useState("");
  const [error, setError] = useState("");
  const update = <K extends keyof Session>(k: K, v: Session[K]) =>
    setS({ ...s, [k]: v });
  return (
    <section className="panel">
      <h2>How did it go?</h2>
      <p className="muted">
        A few honest observations will shape your next practice.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            onSave({
              ...s,
              issues: [...s.issues, ...(custom.trim() ? [custom.trim()] : [])],
            });
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "Could not save your session.",
            );
          }
        }}
      >
        <div className="form-grid">
          <label>
            Date
            <input
              required
              type="date"
              value={s.date}
              max={localDate()}
              onChange={(e) => update("date", e.target.value)}
            />
          </label>
          <label>
            Minutes played
            <input
              required
              type="number"
              min={5}
              max={360}
              value={s.duration}
              onChange={(e) => update("duration", Number(e.target.value))}
            />
          </label>
          <label>
            Session type
            <select
              value={s.kind}
              onChange={(e) =>
                update("kind", e.target.value as Session["kind"])
              }
            >
              <option value="games">Games</option>
              <option value="drills">Drills</option>
              <option value="mixed">Drills + games</option>
            </select>
          </label>
          <label>
            Game format
            <select
              value={s.format}
              onChange={(e) =>
                update("format", e.target.value as Session["format"])
              }
            >
              <option value="doubles">Doubles</option>
              <option value="singles">Singles</option>
              <option value="solo">Solo practice</option>
            </select>
          </label>
        </div>
        <label>
          What felt good?
          <textarea
            maxLength={1000}
            value={s.good}
            onChange={(e) => update("good", e.target.value)}
            placeholder="A shot, a decision, or a moment worth keeping…"
          />
        </label>
        <fieldset>
          <legend>What gave you trouble?</legend>
          <div className="chips">
            {problemCatalog.map((i) => (
              <button
                type="button"
                key={i.id}
                className={s.issues.includes(i.id) ? "chip selected" : "chip"}
                aria-pressed={s.issues.includes(i.id)}
                onClick={() =>
                  update(
                    "issues",
                    s.issues.includes(i.id)
                      ? s.issues.filter((x) => x !== i.id)
                      : [...s.issues, i.id],
                  )
                }
              >
                {i.label}
              </button>
            ))}
          </div>
        </fieldset>
        <label>
          Another issue <small>(optional)</small>
          <input
            maxLength={120}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Describe one other recurring challenge"
          />
        </label>
        <label>
          Notes <small>(optional)</small>
          <textarea
            maxLength={2000}
            value={s.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </label>
        <label>
          How did the session feel?{" "}
          <small>Self-reported, not a skill rating</small>
          <select
            value={s.rating}
            onChange={(e) => update("rating", Number(e.target.value))}
          >
            {["Tough", "Uneven", "Steady", "Good", "Great"].map((x, i) => (
              <option value={i + 1} key={x}>
                {i + 1} — {x}
              </option>
            ))}
          </select>
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="primary">
            Save session
          </button>
        </div>
      </form>
    </section>
  );
}
export function SessionHistory({
  profile: p,
  compact = false,
}: {
  profile: PlayerProfile;
  compact?: boolean;
}) {
  const sessions = [...p.sessions].sort((a, b) => b.date.localeCompare(a.date));
  return sessions.length ? (
    <div className="session-list">
      {sessions.slice(0, compact ? 3 : undefined).map((s) => (
        <article key={s.id} className="session-row">
          <div className="session-icon">
            <CalendarDays size={21} />
          </div>
          <div>
            <h3>
              {s.kind === "mixed"
                ? "Drills + games"
                : s.kind === "games"
                  ? "Game session"
                  : "Practice session"}
            </h3>
            <p className="muted">
              {s.date} · {s.duration} min · {s.format} · Feeling {s.rating}/5
            </p>
            {!compact && (
              <>
                {s.good && (
                  <p>
                    <strong>Felt good:</strong> {s.good}
                  </p>
                )}
                <div className="chips">
                  {s.issues.map((i) => (
                    <span className="badge warning" key={i}>
                      {issueLabel(i)}
                    </span>
                  ))}
                </div>
                {s.notes && <p>{s.notes}</p>}
              </>
            )}
          </div>
        </article>
      ))}
    </div>
  ) : (
    <Empty title="Your practice story starts here.">
      Log your first session to connect what happens on court to what you
      practice next.
    </Empty>
  );
}
export function Sessions({
  profile,
  onSave,
  showForm,
  setShowForm,
}: {
  profile: PlayerProfile;
  onSave: (s: Session) => void;
  showForm: boolean;
  setShowForm: (x: boolean) => void;
}) {
  return (
    <>
      <PageHeading
        kicker="REFLECT. ADJUST. REPEAT."
        title="Your sessions"
        description="Real observations from your time on court."
        action={
          !showForm && (
            <button className="primary" onClick={() => setShowForm(true)}>
              <Plus size={18} />
              Log a session
            </button>
          )
        }
      />
      {showForm ? (
        <SessionForm onSave={onSave} onCancel={() => setShowForm(false)} />
      ) : (
        <section className="panel">
          <SessionHistory profile={profile} />
        </section>
      )}
    </>
  );
}
