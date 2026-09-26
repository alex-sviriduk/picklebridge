import { useState } from "react";
import { RefreshCw, ArrowLeft } from "lucide-react";
import type { PlayerProfile, Topic } from "../types";
import { topics } from "../types";
import { topicNames } from "../data/knowledge";
import { drills } from "../data/drills";
import { generatePlan, selectDrills } from "../lib/recommendations";
import { DrillCard, DrillDetail, PageHeading } from "../components/UI";
export function DrillLibrary({
  profile,
  selected,
  setSelected,
}: {
  profile: PlayerProfile;
  selected: string | null;
  setSelected: (id: string | null) => void;
}) {
  const [filter, setFilter] = useState<Topic | "">("");
  const [players, setPlayers] = useState("");
  const [query, setQuery] = useState("");
  const detail = drills.find((d) => d.id === selected);
  const results = selectDrills(profile, filter || undefined).filter(
    (d) =>
      (!players || d.players === Number(players)) &&
      `${d.name} ${d.cue}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        kicker="LESS GUESSING. MORE PRACTICE."
        title="Your drill library"
        description="Start with your recommended skills, or find a drill for today's court time."
      />
      {detail ? (
        <>
          <button className="text-link back" onClick={() => setSelected(null)}>
            <ArrowLeft size={17} />
            Back to drills
          </button>
          <DrillDetail drill={detail} profile={profile} />
        </>
      ) : (
        <>
          <div className="filter-bar">
            <label>
              Find a drill
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or cue"
              />
            </label>
            <label>
              Skill
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as Topic | "")}
              >
                <option value="">All skills · recommended first</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {topicNames[t]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Players
              <select
                value={players}
                onChange={(e) => setPlayers(e.target.value)}
              >
                <option value="">Any group size</option>
                <option value="1">Solo</option>
                <option value="2">Two players</option>
                <option value="4">Four players</option>
              </select>
            </label>
          </div>
          <p className="muted">
            {results.length} drills · Every drill includes a target and
            progression
          </p>
          <div className="drill-grid">
            {results.map((d) => (
              <DrillCard
                key={d.id}
                drill={d}
                profile={profile}
                onOpen={setSelected}
              />
            ))}
          </div>
          {!results.length && (
            <div className="empty">
              No drills match those filters. Try another skill or group size.
            </div>
          )}
        </>
      )}
    </>
  );
}
export function TrainingPlan({
  profile: p,
  onSave,
  onDrill,
}: {
  profile: PlayerProfile;
  onSave: (p: PlayerProfile) => void;
  onDrill: (id: string) => void;
}) {
  const plan = generatePlan(p);
  return (
    <>
      <PageHeading
        kicker="SMALL SESSIONS. CLEAR INTENT."
        title="My practice plan"
        description="A flexible week built around your current focus. Repeat a session when it helps."
        action={
          <button
            className="secondary"
            onClick={() => onSave({ ...p, planRevision: p.planRevision + 1 })}
          >
            <RefreshCw size={16} />
            Regenerate plan
          </button>
        }
      />
      <div className="plan-settings">
        <label>
          Practice days per week
          <select
            value={p.assessment.days}
            onChange={(e) =>
              onSave({
                ...p,
                assessment: { ...p.assessment, days: Number(e.target.value) },
              })
            }
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option value={n} key={n}>
                {n} {n === 1 ? "day" : "days"}
              </option>
            ))}
          </select>
        </label>
        <p>
          Your focus and recent issues determine drill order. Regeneration
          rotates the practice mix. Targets scale to your level.
        </p>
      </div>
      <div className="plan-grid">
        {plan.map((day) => (
          <section className="panel plan-day" key={day.day}>
            <header>
              <span className="eyebrow">SESSION 0{day.day}</span>
              <span className="badge">
                {day.drills.reduce((n, d) => n + d.minutes, 0) + 10} min
              </span>
            </header>
            <h2>{topicNames[day.drills[0].topic]}</h2>
            <p className="muted">{day.reason}</p>
            <ol>
              {day.drills.map((d) => (
                <li key={d.id}>
                  <span className="plan-time">
                    {d.minutes}
                    <small>MIN</small>
                  </span>
                  <button onClick={() => onDrill(d.id)}>
                    {d.name}
                    <small>
                      {p.assessment.level === "new" ||
                      p.assessment.level === "few-times"
                        ? "Start slowly with a large target"
                        : d.progression}
                    </small>
                  </button>
                </li>
              ))}
            </ol>
            <div className="constraint">
              <span className="eyebrow">FINISH WITH 10 MINUTES OF PLAY</span>
              <p>{day.constraint}</p>
            </div>
          </section>
        ))}
      </div>
      <p className="muted">
        Equipment and player requirements are listed in each drill. Swap to a
        solo drill in the library if you do not have a partner.
      </p>
    </>
  );
}
