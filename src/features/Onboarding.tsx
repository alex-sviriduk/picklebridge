import { useState } from "react";
import type { Assessment } from "../types";
import { sports, levels, assessmentSchema } from "../types";
import { goals, sportNames } from "../data/knowledge";
import { defaultAssessment } from "../data/defaults";
export function Onboarding({
  initial,
  onComplete,
  onCancel,
}: {
  initial?: Assessment;
  onComplete: (a: Assessment) => void;
  onCancel?: () => void;
}) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState(initial ?? defaultAssessment);
  const [error, setError] = useState("");
  const update = <K extends keyof Assessment>(k: K, v: Assessment[K]) =>
    setA({ ...a, [k]: v });
  const toggle = (k: "goals" | "strengths", v: string) =>
    update(k, a[k].includes(v) ? a[k].filter((x) => x !== v) : [...a[k], v]);
  function next() {
    if (step === 0 && !a.name.trim()) {
      setError("Add your name to personalize your plan.");
      return;
    }
    setError("");
    if (step < 2) setStep(step + 1);
    else {
      const parsed = assessmentSchema.safeParse(a);
      if (!parsed.success) {
        setError("Choose at least one goal and check your numeric answers.");
        return;
      }
      onComplete(parsed.data);
    }
  }
  return (
    <div className="onboarding">
      <aside className="intro">
        <a className="brand" href="#">
          <span className="brand-mark">P</span>PickleBridge
        </a>
        <div>
          <span className="eyebrow light">YOUR NEXT CHAPTER ON COURT</span>
          <h1>
            Don't start over.
            <br />
            <em>Translate your game.</em>
          </h1>
          <p>
            Your experience is a head start. Find what carries over, what needs
            a small adjustment, and what to practice next.
          </p>
          <div className="court" aria-label="A pickleball court diagram">
            <div />
            <span>YOUR GAME. A NEW COURT.</span>
            <div />
          </div>
        </div>
        <small>Built around your background. Refined by your practice.</small>
      </aside>
      <main className="assessment">
        <div className="step-label">
          <span>YOUR PLAYER PROFILE</span>
          <span>0{step + 1} / 03</span>
        </div>
        <progress aria-label="Assessment progress" value={step + 1} max={3} />
        <div className="step-tabs">
          {["Your background", "Your new game", "Your goals"].map((s, i) => (
            <span key={s} className={step === i ? "active" : ""}>
              {s}
            </span>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
        >
          {step === 0 && (
            <>
              <h2>Bring your experience.</h2>
              <p className="muted">
                We'll use it to shape your first training priorities.
              </p>
              <label>
                What should we call you?
                <input
                  value={a.name}
                  autoComplete="given-name"
                  maxLength={60}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Your first name"
                />
              </label>
              <fieldset>
                <legend>Your athletic background</legend>
                <div className="choice-grid">
                  {sports.map((s) => (
                    <button
                      type="button"
                      key={s}
                      aria-pressed={a.sport === s}
                      className={a.sport === s ? "choice selected" : "choice"}
                      onClick={() => update("sport", s)}
                    >
                      {sportNames[s]}
                      <span>
                        {s === "tennis"
                          ? "Our most detailed pathway"
                          : s === "none"
                            ? "Build a fresh foundation"
                            : "Translate your strengths"}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>
              {a.sport !== "none" && (
                <div className="form-grid">
                  <label>
                    Years played
                    <input
                      type="number"
                      min="0"
                      max="90"
                      value={a.years}
                      onChange={(e) => update("years", Number(e.target.value))}
                    />
                  </label>
                  <label>
                    Previous level
                    <select
                      value={a.backgroundLevel}
                      onChange={(e) =>
                        update("backgroundLevel", e.target.value)
                      }
                    >
                      {["Recreational", "Club", "Competitive", "Advanced"].map(
                        (x) => (
                          <option key={x}>{x}</option>
                        ),
                      )}
                    </select>
                  </label>
                </div>
              )}
            </>
          )}
          {step === 1 && (
            <>
              <h2>A little about your game.</h2>
              <p className="muted">
                No rating needed. An honest starting point is enough.
              </p>
              <div className="form-grid">
                <label>
                  Pickleball experience
                  <select
                    value={a.level}
                    onChange={(e) =>
                      update("level", e.target.value as Assessment["level"])
                    }
                  >
                    {levels.map((x, i) => (
                      <option key={x} value={x}>
                        {
                          [
                            "Completely new",
                            "Played a few times",
                            "Beginner",
                            "Intermediate",
                            "Advanced",
                          ][i]
                        }
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Months playing
                  <input
                    type="number"
                    min="0"
                    max="600"
                    value={a.months}
                    onChange={(e) => update("months", Number(e.target.value))}
                  />
                </label>
                <label>
                  Handedness
                  <select
                    value={a.handedness}
                    onChange={(e) =>
                      update(
                        "handedness",
                        e.target.value as Assessment["handedness"],
                      )
                    }
                  >
                    <option value="right">Right-handed</option>
                    <option value="left">Left-handed</option>
                  </select>
                </label>
              </div>
              {a.sport === "tennis" && (
                <>
                  <div className="form-grid">
                    <label>
                      Tennis format
                      <select
                        value={a.format}
                        onChange={(e) =>
                          update(
                            "format",
                            e.target.value as Assessment["format"],
                          )
                        }
                      >
                        <option value="singles">Singles</option>
                        <option value="doubles">Doubles</option>
                        <option value="both">Both</option>
                      </select>
                    </label>
                    <label>
                      Playing style
                      <select
                        value={a.style}
                        onChange={(e) => update("style", e.target.value)}
                      >
                        {[
                          "All-court",
                          "Baseline",
                          "Serve-and-volley",
                          "Aggressive",
                          "Defensive",
                        ].map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Backhand
                      <select
                        value={a.backhand}
                        onChange={(e) =>
                          update(
                            "backhand",
                            e.target.value as Assessment["backhand"],
                          )
                        }
                      >
                        <option value="one-handed">One-handed</option>
                        <option value="two-handed">Two-handed</option>
                        <option value="unknown">Not sure</option>
                      </select>
                    </label>
                    <label>
                      Comfort at the net
                      <select
                        value={a.netComfort}
                        onChange={(e) =>
                          update(
                            "netComfort",
                            e.target.value as Assessment["netComfort"],
                          )
                        }
                      >
                        <option value="low">Still developing</option>
                        <option value="medium">Comfortable</option>
                        <option value="high">A strength</option>
                      </select>
                    </label>
                  </div>
                  <div className="inline">
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={a.topspin}
                        onChange={(e) => update("topspin", e.target.checked)}
                      />
                      Topspin experience
                    </label>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={a.slice}
                        onChange={(e) => update("slice", e.target.checked)}
                      />
                      Slice experience
                    </label>
                  </div>
                </>
              )}
              <fieldset>
                <legend>
                  Your strengths <small>(optional)</small>
                </legend>
                <div className="chips">
                  {[
                    "Footwork",
                    "Forehand",
                    "Backhand",
                    "Volleys",
                    "Touch",
                    "Strategy",
                  ].map((x) => (
                    <button
                      type="button"
                      className={
                        a.strengths.includes(x) ? "chip selected" : "chip"
                      }
                      aria-pressed={a.strengths.includes(x)}
                      key={x}
                      onClick={() => toggle("strengths", x)}
                    >
                      {x}
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          )}
          {step === 2 && (
            <>
              <h2>Make practice count.</h2>
              <p className="muted">
                Choose what matters to you. You can change this anytime.
              </p>
              <fieldset>
                <legend>Your goals</legend>
                <div className="choice-grid">
                  {goals.map((g) => (
                    <button
                      type="button"
                      key={g}
                      aria-pressed={a.goals.includes(g)}
                      className={
                        a.goals.includes(g) ? "choice selected" : "choice"
                      }
                      onClick={() => toggle("goals", g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label>
                Practice days per week
                <select
                  value={a.days}
                  onChange={(e) => update("days", Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "day" : "days"}
                    </option>
                  ))}
                </select>
              </label>
              <div className="notice">
                Your profile stays in this browser. Recommendations are
                practical coaching rules, not a measured skill rating.
              </div>
            </>
          )}
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <div className="form-actions">
            {step > 0 ? (
              <button
                type="button"
                className="secondary"
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            ) : onCancel ? (
              <button type="button" className="secondary" onClick={onCancel}>
                Cancel
              </button>
            ) : (
              <span />
            )}
            <button className="primary" type="submit">
              {step === 2 ? "Build my training profile" : "Continue"}{" "}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
