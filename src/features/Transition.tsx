import type { PlayerProfile, Topic } from "../types";
import { habitsFor, sportNames, topicNames } from "../data/knowledge";
import { prioritiesFor, transferFor } from "../lib/recommendations";
import { FocusList, PageHeading } from "../components/UI";
export function Transition({
  profile: p,
  onFocus,
}: {
  profile: PlayerProfile;
  onFocus: (t: Topic, a: "pin" | "dismiss" | "restore") => void;
}) {
  return (
    <>
      <PageHeading
        kicker="YOUR TRANSITION PROFILE"
        title="A head start. A few new habits."
        description={`${sportNames[p.assessment.sport]} gives you a starting point. Your practice will tell us what to refine.`}
      />
      <section className="transfer-banner">
        <div>
          <span className="eyebrow light">YOUR PATHWAY</span>
          <h2>
            {sportNames[p.assessment.sport]} <span aria-hidden="true">→</span>{" "}
            Pickleball
          </h2>
          <p>
            {p.assessment.sport === "tennis"
              ? `${p.assessment.years} years of tennis. ${p.assessment.style} instincts. A shorter swing and a new relationship with the net.`
              : "Keep your useful instincts while learning the bounce, the paddle and the kitchen."}
          </p>
        </div>
        <span className="profile-stamp">
          PROFILE
          <br />
          <strong>READY</strong>
        </span>
      </section>
      <details className="panel section-block">
        <summary>
          <strong>New-court essentials: two rules to learn first</strong>
        </summary>
        <p>
          The serve must bounce before the return, and the return must bounce
          before the serving team hits it. After those two bounces, you can
          volley outside the non-volley zone.
        </p>
        <p>
          The kitchen is the non-volley zone. You can enter it for a bounced
          ball, but cannot volley while touching it or let volley momentum carry
          you into it.
        </p>
        <a
          href="https://usapickleball.org/rules/summary/"
          target="_blank"
          rel="noreferrer"
          className="text-link"
        >
          Read the USA Pickleball rules summary ↗
        </a>
      </details>
      <section className="section-block">
        <div className="section-heading">
          <h2>Your skill transfer map</h2>
          <span className="muted">
            Qualitative guidance, not a measured rating
          </span>
        </div>
        <div className="transfer-grid">
          {transferFor(p.assessment).map((t) => (
            <article className="panel transfer-card" key={t.name}>
              <span
                className={`badge ${t.strength === "Strong transfer" ? "positive" : ""}`}
              >
                {t.strength}
              </span>
              <h3>{t.name}</h3>
              <p>{t.detail}</p>
              <div className="adjustment">
                <strong>THE ADJUSTMENT</strong>
                <p>{t.adjustment}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section-block">
        <h2>Habits worth a second look</h2>
        <p className="muted">
          These are possibilities based on your background, not a diagnosis of
          your technique.
        </p>
        <div className="habit-list">
          {habitsFor(p.assessment.sport).map((h, i) => (
            <details key={h.name} className="panel">
              <summary>
                <span className="habit-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {h.name}
                <span className="badge">{topicNames[h.topic]}</span>
              </summary>
              <div className="habit-body">
                <p>
                  <strong>Why it feels familiar:</strong> {h.why}
                </p>
                <p>
                  <strong>Where it gets tricky:</strong> {h.problem}
                </p>
                <div className="cue">“{h.cue}”</div>
              </div>
            </details>
          ))}
        </div>
      </section>
      <section className="panel">
        <h2>Your training path</h2>
        <FocusList priorities={prioritiesFor(p)} onFocus={onFocus} limit={6} />
        {p.dismissed.length > 0 && (
          <div className="notice">
            <strong>Dismissed focus areas</strong>
            <div className="chips">
              {p.dismissed.map((t) => (
                <button
                  className="chip"
                  key={t}
                  onClick={() => onFocus(t, "restore")}
                >
                  Restore {topicNames[t]}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
