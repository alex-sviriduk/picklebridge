import { useState } from "react";
import type { PlayerProfile } from "../types";
import { PageHeading } from "../components/UI";
import { sportNames, topicNames } from "../data/knowledge";
export function downloadText(text: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function Profile({
  profile: p,
  onEdit,
  onReset,
  onExport,
}: {
  profile: PlayerProfile;
  onEdit: () => void;
  onReset: () => void;
  onExport: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <PageHeading
        kicker="YOUR STARTING POINT"
        title="Player profile"
        description="Your background can change. Your court history comes with you."
        action={
          <button className="primary" onClick={onEdit}>
            Edit assessment
          </button>
        }
      />
      <div className="profile-grid">
        <section className="panel">
          <div className="profile-avatar">
            {p.assessment.name.slice(0, 1).toUpperCase()}
          </div>
          <h2>{p.assessment.name}</h2>
          <p>{sportNames[p.assessment.sport]} → Pickleball</p>
          <dl className="profile-facts">
            <div>
              <dt>Background experience</dt>
              <dd>
                {p.assessment.sport === "none"
                  ? "Starting fresh"
                  : `${p.assessment.years} years · ${p.assessment.backgroundLevel}`}
              </dd>
            </div>
            <div>
              <dt>Pickleball level</dt>
              <dd>{p.assessment.level.replace("-", " ")}</dd>
            </div>
            <div>
              <dt>Handedness</dt>
              <dd>{p.assessment.handedness}</dd>
            </div>
            <div>
              <dt>Practice schedule</dt>
              <dd>{p.assessment.days} days / week</dd>
            </div>
            <div>
              <dt>Assessment</dt>
              <dd>Complete</dd>
            </div>
          </dl>
          <h3>Your goals</h3>
          <div className="chips">
            {p.assessment.goals.map((g) => (
              <span className="badge" key={g}>
                {g}
              </span>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>How your focus has changed</h2>
          <p className="muted">
            A record of changes to your top three priorities.
          </p>
          <div className="timeline">
            {[...p.focusHistory]
              .reverse()
              .slice(0, 12)
              .map((x, i) => (
                <article key={`${x.date}-${i}`}>
                  <small>{new Date(x.date).toLocaleDateString()}</small>
                  <h3>{x.topics.map((t) => topicNames[t]).join(" · ")}</h3>
                  <p>{x.reason}</p>
                </article>
              ))}
          </div>
        </section>
      </div>
      <section className="panel section-block">
        <h2>Your data stays with you.</h2>
        <p>
          This profile, session history and coaching conversation are stored in
          this browser on this device. There is no account or cloud sync. Export
          a backup before clearing browser data.
        </p>
        <div className="inline">
          <button className="secondary" onClick={onExport}>
            Export profile backup
          </button>
          <button className="danger" onClick={() => setConfirm(true)}>
            Reset profile
          </button>
        </div>
        {confirm && (
          <div className="reset-confirm" role="alert">
            <h3>Delete this local profile?</h3>
            <p>
              This removes your assessment, sessions, focus history and coaching
              conversation from this browser. Export a backup first if you want
              to keep them.
            </p>
            <div className="inline">
              <button className="secondary" onClick={() => setConfirm(false)}>
                Keep my profile
              </button>
              <button className="danger" onClick={onReset}>
                Yes, reset everything
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
