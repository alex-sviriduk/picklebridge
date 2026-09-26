import type { ReactNode } from "react";
import { ArrowUpRight, Clock3, Users } from "lucide-react";
import type { Drill, PlayerProfile, Priority, Topic } from "../types";
import { topicNames } from "../data/knowledge";
export function PageHeading({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <span className="eyebrow">{kicker}</span>
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {action}
    </header>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function FocusList({
  priorities,
  onFocus,
  limit = 3,
}: {
  priorities: Priority[];
  onFocus?: (t: Topic, a: "pin" | "dismiss" | "restore") => void;
  limit?: number;
}) {
  return (
    <ol className="focus-list">
      {priorities.slice(0, limit).map((p, i) => (
        <li key={p.topic}>
          <span className="focus-number">{String(i + 1).padStart(2, "0")}</span>
          <div>
            <h3>
              {topicNames[p.topic]}{" "}
              {p.pinned && <span className="badge">Pinned</span>}
            </h3>
            <p>{p.reason}</p>
            {onFocus && (
              <div className="text-actions">
                <button
                  onClick={() => onFocus(p.topic, p.pinned ? "restore" : "pin")}
                >
                  {p.pinned ? "Unpin" : "Pin focus"}
                </button>
                <button onClick={() => onFocus(p.topic, "dismiss")}>
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
export function DrillCard({
  drill: d,
  profile: p,
  onOpen,
}: {
  drill: Drill;
  profile: PlayerProfile;
  onOpen: (id: string) => void;
}) {
  return (
    <article className="drill-card">
      <div className={`drill-art art-${d.topic}`}>
        <span>{topicNames[d.topic]}</span>
        <span className="drill-symbol" aria-hidden="true">
          {d.topic === "dinks" ? "↝" : d.topic === "volleys" ? "↔" : "◎"}
        </span>
      </div>
      <div className="drill-body">
        <div className="drill-meta">
          <span>
            <Clock3 size={14} />
            {d.minutes} min
          </span>
          <span>
            <Users size={14} />
            {d.players} {d.players === 1 ? "player" : "players"}
          </span>
        </div>
        <h3>{d.name}</h3>
        <p>{p.assessment.sport === "tennis" ? d.tennis : d.cue}</p>
        <button className="text-link" onClick={() => onOpen(d.id)}>
          View drill <ArrowUpRight size={16} />
        </button>
      </div>
    </article>
  );
}
export function DrillDetail({
  drill: d,
  profile: p,
}: {
  drill: Drill;
  profile: PlayerProfile;
}) {
  return (
    <section className="panel drill-detail">
      <span className="eyebrow">
        {topicNames[d.topic]} · {d.minutes} MINUTES
      </span>
      <h2>{d.name}</h2>
      <div className="chips">
        <span className="badge">
          {d.players} {d.players === 1 ? "player" : "players"}
        </span>
        <span className="badge">All levels · scale the target</span>
      </div>
      <p>
        <strong>Equipment:</strong> {d.equipment}
      </p>
      {p.assessment.sport === "tennis" && (
        <div className="notice">
          <strong>Your tennis adjustment:</strong> {d.tennis}
        </div>
      )}
      <h3>How to practice</h3>
      <ol className="instructions">
        {d.instructions.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ol>
      <div className="split">
        <div>
          <h4>Success target</h4>
          <p>{d.target}</p>
        </div>
        <div>
          <h4>Your cue</h4>
          <p>{d.cue}</p>
        </div>
      </div>
      <p>
        <strong>Watch out for:</strong> {d.mistake}
      </p>
      <p>
        <strong>Make it harder:</strong> {d.progression}
      </p>
      <p className="muted">
        Start with a smaller count or slower feed if you are new. Move up only
        when the current version feels controlled.
      </p>
    </section>
  );
}
