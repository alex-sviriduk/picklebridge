import {
  ArrowUpRight,
  Plus,
  MessageCircle,
  Activity,
  Timer,
  Target,
} from "lucide-react";
import type { PlayerProfile, Topic } from "../types";
import { sportNames, topicNames } from "../data/knowledge";
import {
  detectIssues,
  generatePlan,
  prioritiesFor,
  selectDrills,
} from "../lib/recommendations";
import { DrillCard, Empty, FocusList, PageHeading } from "../components/UI";
import { SessionHistory } from "./Sessions";
export type Page =
  | "Dashboard"
  | "My Transition"
  | "Coach"
  | "Drills"
  | "My Plan"
  | "Sessions"
  | "Profile";
export function Dashboard({
  profile: p,
  navigate,
  onLog,
  onDrill,
  onFocus,
  onResolve,
}: {
  profile: PlayerProfile;
  navigate: (p: Page) => void;
  onLog: () => void;
  onDrill: (id: string) => void;
  onFocus: (t: Topic, a: "pin" | "dismiss" | "restore") => void;
  onResolve: (id: string) => void;
}) {
  const priorities = prioritiesFor(p);
  const issues = detectIssues(p);
  const plan = generatePlan(p);
  const recommended =
    selectDrills(p).find((d) => !p.dismissed.includes(d.topic)) ??
    selectDrills(p)[0];
  return (
    <>
      <PageHeading
        kicker="YOUR GAME, MOVING FORWARD"
        title={`Let's build on it, ${p.assessment.name}.`}
        description={`${sportNames[p.assessment.sport]} background · ${p.assessment.level.replace("-", " ")} in pickleball`}
        action={
          <button className="primary" onClick={onLog}>
            <Plus size={18} />
            Log a session
          </button>
        }
      />
      <div className="dashboard-grid">
        <section className="focus-panel">
          <div className="section-heading">
            <span className="eyebrow light">YOUR NEXT CHAPTER</span>
            <Target size={22} />
          </div>
          <h2>
            One clear focus.
            <br />
            Better practice.
          </h2>
          <p>
            Your experience is the starting point.
            <br />
            Your sessions decide what comes next.
          </p>
          <div className="focus-feature">
            <span>START HERE</span>
            <h3>
              {priorities[0]
                ? topicNames[priorities[0].topic]
                : "Choose your next focus"}
            </h3>
            <p>
              {priorities[0]?.reason ??
                "Restore a focus area in My Transition to personalize your training path."}
            </p>
          </div>
          <button className="lime-button" onClick={() => navigate("My Plan")}>
            Open my practice plan <ArrowUpRight size={19} />
          </button>
        </section>
        <section className="panel priorities-panel">
          <div className="section-heading">
            <h2>Current priorities</h2>
            <span className="badge">Adaptive</span>
          </div>
          <FocusList priorities={priorities} onFocus={onFocus} />
          <button
            className="text-link"
            onClick={() => navigate("My Transition")}
          >
            See your full transition <ArrowUpRight size={17} />
          </button>
        </section>
        <section className="stats-strip">
          <div>
            <Activity size={19} />
            <strong>{p.sessions.length}</strong>
            <span>sessions logged</span>
          </div>
          <div>
            <Timer size={19} />
            <strong>{p.sessions.reduce((n, s) => n + s.duration, 0)}</strong>
            <span>minutes on court</span>
          </div>
          <div>
            <Target size={19} />
            <strong>{p.assessment.days}</strong>
            <span>practice days planned</span>
          </div>
        </section>
        <section className="panel patterns-panel">
          <div className="section-heading">
            <h2>What your sessions are saying</h2>
            <span className="badge">Last 30 days</span>
          </div>
          {issues.length ? (
            <div className="issue-list">
              {issues.slice(0, 4).map((i) => (
                <article key={i.id}>
                  <div>
                    <span className={`badge ${i.count >= 2 ? "warning" : ""}`}>
                      {i.status} · {i.count}
                    </span>
                    <h3>{i.label}</h3>
                    <p>
                      {i.count >= 2
                        ? "This pattern is raising its related practice priority."
                        : "One observation. Keep an eye on it next time."}
                    </p>
                  </div>
                  <button className="text-link" onClick={() => onResolve(i.id)}>
                    Mark resolved
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <Empty title="Patterns come from practice.">
              Log what gave you trouble. Two recent observations flag an
              emerging issue; three or more flag a recurring one.
            </Empty>
          )}
          <p className="fine-print">
            Based on your last 10 sessions within 30 days, plus explicit issue
            notes. Self-reported observations, not measured performance.
          </p>
        </section>
        <div className="next-drill">
          <div className="section-heading">
            <h2>Your next drill</h2>
            <button className="text-link" onClick={() => navigate("Drills")}>
              Browse all
            </button>
          </div>
          <DrillCard drill={recommended} profile={p} onOpen={onDrill} />
        </div>
        <section className="panel recent-panel">
          <div className="section-heading">
            <h2>Recent court time</h2>
            <button className="text-link" onClick={() => navigate("Sessions")}>
              View sessions
            </button>
          </div>
          <SessionHistory profile={p} compact />
        </section>
        <section className="week-panel">
          <span className="eyebrow">THIS WEEK'S PRACTICE</span>
          <h2>
            {plan.length} days.
            <br />A plan that moves with you.
          </h2>
          <p>
            Start with {plan[0].drills[0].name.toLowerCase()}. Each session
            includes a focused practice game.
          </p>
          <button className="text-link" onClick={() => navigate("My Plan")}>
            Explore my plan <ArrowUpRight size={17} />
          </button>
        </section>
        <section className="coach-strip">
          <MessageCircle size={27} />
          <div>
            <h3>Something feel different on this court?</h3>
            <p>Translate a tennis instinct into a pickleball adjustment.</p>
          </div>
          <button className="secondary" onClick={() => navigate("Coach")}>
            Ask the coach <ArrowUpRight size={17} />
          </button>
        </section>
      </div>
    </>
  );
}
