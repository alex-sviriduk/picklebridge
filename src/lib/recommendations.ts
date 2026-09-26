import type {
  Assessment,
  CoachingContext,
  Issue,
  PlayerProfile,
  Priority,
  Topic,
} from "../types";
import { topics } from "../types";
import {
  habitsFor,
  problemCatalog,
  sportNames,
  startingPriorities,
  topicNames,
  transfers,
} from "../data/knowledge";
import { drills } from "../data/drills";
export const localDate = (now = new Date()) =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
export const normalizeIssue = (text: string) =>
  text.trim().toLowerCase().replace(/\s+/g, " ");
export const issueLabel = (id: string) =>
  problemCatalog.find((x) => x.id === id)?.label ?? id;
export function detectIssues(p: PlayerProfile, now = new Date()): Issue[] {
  const end = localDate(now);
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 29);
  const start = localDate(startDate);
  const observations = new Map<string, Set<string>>();
  const add = (raw: string, date: string, event: string) => {
    const id = normalizeIssue(raw);
    if (date < start || date > end || date <= (p.resolved[id] ?? "")) return;
    const seen = observations.get(id) ?? new Set<string>();
    seen.add(event);
    observations.set(id, seen);
  };
  [...p.sessions]
    .filter((s) => s.date >= start && s.date <= end)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)
    .forEach((s) => s.issues.forEach((i) => add(i, s.date, s.id)));
  p.issueEvents.forEach((e) => add(e.issue, e.date, `day:${e.date}`));
  return [...observations]
    .map(
      ([id, seen]) =>
        ({
          id,
          label: issueLabel(id),
          count: seen.size,
          status:
            seen.size >= 3
              ? "Recurring"
              : seen.size === 2
                ? "Emerging"
                : "Observation",
          topic:
            problemCatalog.find((x) => x.id === id)?.topic ?? "consistency",
        }) as Issue,
    )
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
export function prioritiesFor(p: PlayerProfile, now = new Date()): Priority[] {
  const a = p.assessment;
  const base = startingPriorities[a.sport];
  const issues = detectIssues(p, now);
  return topics
    .filter((t) => !p.dismissed.includes(t))
    .map((topic) => {
      let score = base.includes(topic) ? 60 - base.indexOf(topic) * 6 : 10;
      const reasons: string[] = [];
      if (base.includes(topic))
        reasons.push(
          `A starting priority for your ${sportNames[a.sport].toLowerCase()} background`,
        );
      if (
        a.level === "new" &&
        ["serves", "returns", "consistency"].includes(topic)
      ) {
        score += 22;
        reasons.push("Build a reliable foundation as a new player");
      }
      if (a.sport === "tennis") {
        if (
          (a.style === "Baseline" || a.format === "singles") &&
          topic === "kitchen"
        ) {
          score += 18;
          reasons.push(
            "Your baseline or singles experience makes forward positioning worth practicing",
          );
        }
        if (a.netComfort === "low" && topic === "volleys") {
          score += 18;
          reasons.push("You described net play as still developing");
        }
        if (a.netComfort === "high" && topic === "volleys") {
          score -= 10;
          reasons.push(
            "Your net confidence lets us spend more time on new skills",
          );
        }
        if (a.backhand === "one-handed" && topic === "volleys") {
          score += 4;
          reasons.push("Rehearse a compact backhand block");
        }
        if (a.topspin && topic === "dinks") {
          score += 6;
          reasons.push("Separate topspin acceleration from soft kitchen touch");
        }
      }
      const goalMatch =
        (topic === "doubles" &&
          a.goals.some((g) => /doubles|league|Tournament/.test(g))) ||
        (topic === "consistency" && a.goals.includes("Improve consistency")) ||
        (topic === "dinks" && a.goals.includes("Learn kitchen play"));
      if (goalMatch) {
        score += 22;
        reasons.push("Matches one of your selected goals");
      }
      if (
        ["intermediate", "advanced"].includes(a.level) &&
        ["resets", "drops", "transition"].includes(topic)
      ) {
        score += 12;
        reasons.push(
          "Adds touch and movement options for your experience level",
        );
      }
      const related = issues.filter((i) => i.topic === topic);
      for (const i of related) {
        score += i.count >= 2 ? 55 + Math.min(i.count, 5) * 8 : 8;
        reasons.push(
          `${i.label}: ${i.count} recent observation${i.count === 1 ? "" : "s"}`,
        );
      }
      if (
        topic === "volleys" &&
        issues.some((i) => i.id === "dink-popups" && i.count >= 2)
      ) {
        score += 18;
        reasons.push("Compact mechanics also support lower dinks");
      }
      const pinned = p.pinned.includes(topic);
      if (pinned) {
        score += 1000;
        reasons.unshift("Pinned by you");
      }
      return {
        topic,
        score,
        pinned,
        reason: reasons.length
          ? reasons.join(". ") + "."
          : "A supporting skill to round out your practice.",
      };
    })
    .sort((a, b) => b.score - a.score || a.topic.localeCompare(b.topic));
}
export function transferFor(a: Assessment) {
  return transfers[a.sport].map((t) => ({
    ...t,
    adjustment:
      t.adjustment +
      (a.sport === "tennis" &&
      t.name === "Volley instincts" &&
      a.netComfort === "high"
        ? " Your net confidence is useful; practice reducing paddle travel."
        : "") +
      (a.sport === "tennis" && t.name === "Topspin forehand" && !a.topspin
        ? " You did not report topspin experience, so establish face control first."
        : ""),
  }));
}
export function selectDrills(p: PlayerProfile, topic?: Topic) {
  const priorities = prioritiesFor(p);
  return [...drills]
    .filter(
      (d) =>
        d.levels.includes(p.assessment.level) && (!topic || d.topic === topic),
    )
    .sort((a, b) => {
      const score = (t: Topic) =>
        priorities.find((x) => x.topic === t)?.score ?? 0;
      return score(b.topic) - score(a.topic) || a.id.localeCompare(b.id);
    });
}
export function generatePlan(p: PlayerProfile) {
  const available = selectDrills(p).filter(
    (d) => !p.dismissed.includes(d.topic),
  );
  const ranked = available.length ? available : selectDrills(p);
  return Array.from({ length: p.assessment.days }, (_, i) => {
    const first = ranked[(i + p.planRevision) % Math.min(ranked.length, 4)];
    const second = ranked[(i + p.planRevision + 3) % ranked.length];
    const third = ranked[(i + p.planRevision + 6) % ranked.length];
    return {
      day: i + 1,
      drills: [first, second, third].filter(
        (d, index, all) => all.findIndex((x) => x.id === d.id) === index,
      ),
      constraint: p.assessment.goals.some((g) =>
        /doubles|league|Tournament/.test(g),
      )
        ? "In doubles, call middle balls and advance together."
        : "Play five cooperative points with a controlled third shot.",
      reason: `Built around ${topicNames[first.topic].toLowerCase()} and your ${p.assessment.days}-day practice schedule.`,
    };
  });
}
export function buildContext(p: PlayerProfile): CoachingContext {
  return {
    profile: p.assessment,
    priorities: prioritiesFor(p).slice(0, 6),
    issues: detectIssues(p),
    recentSessions: [...p.sessions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5),
    habits: habitsFor(p.assessment.sport),
  };
}
