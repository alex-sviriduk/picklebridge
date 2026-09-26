import {
  assessmentSchema,
  profileSchema,
  sessionSchema,
  type Assessment,
  type PlayerProfile,
  type Session,
  type Topic,
} from "../types";
import type { PlayerRepository } from "./persistence";
import {
  detectIssues,
  generatePlan,
  localDate,
  normalizeIssue,
  prioritiesFor,
} from "./recommendations";
export function createProfile(input: Assessment): PlayerProfile {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    assessment: assessmentSchema.parse(input),
    sessions: [],
    pinned: [],
    dismissed: [],
    resolved: {},
    issueEvents: [],
    focusHistory: [],
    planRevision: 0,
    chat: [],
  };
}
export class PlayerService {
  constructor(private repository: PlayerRepository) {}
  save(p: PlayerProfile, reason = "Profile updated") {
    const next = profileSchema.parse({
      ...p,
      updatedAt: new Date().toISOString(),
    });
    const focus = prioritiesFor(next)
      .slice(0, 3)
      .map((x) => x.topic);
    const last = next.focusHistory.at(-1);
    if (JSON.stringify(last?.topics) !== JSON.stringify(focus))
      next.focusHistory.push({ date: next.updatedAt, topics: focus, reason });
    this.repository.save(next);
    return next;
  }
  get_player_profile() {
    return this.repository.load();
  }
  get_recent_sessions(p: PlayerProfile) {
    return [...p.sessions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);
  }
  get_recurring_issues(p: PlayerProfile) {
    return detectIssues(p);
  }
  log_session(p: PlayerProfile, input: Session) {
    const session = sessionSchema.parse(input);
    const parsed = new Date(`${session.date}T12:00:00`);
    if (
      !Number.isFinite(parsed.getTime()) ||
      localDate(parsed) !== session.date ||
      session.date > localDate()
    )
      throw new Error("Choose a valid session date, no later than today.");
    session.issues = [...new Set(session.issues.map(normalizeIssue))];
    return this.save(
      {
        ...p,
        sessions: [session, ...p.sessions.filter((x) => x.id !== session.id)],
      },
      "Session observations changed your training focus",
    );
  }
  update_player_focus(
    p: PlayerProfile,
    topic: Topic,
    action: "pin" | "dismiss" | "restore",
  ) {
    if (
      action === "dismiss" &&
      !p.dismissed.includes(topic) &&
      p.dismissed.length >= 11
    )
      throw new Error(
        "Keep at least one focus area active so your practice plan has a direction.",
      );
    const pinned = p.pinned.filter((x) => x !== topic);
    const dismissed = p.dismissed.filter((x) => x !== topic);
    if (action === "pin") pinned.push(topic);
    if (action === "dismiss") dismissed.push(topic);
    return this.save({ ...p, pinned, dismissed }, "You adjusted your focus");
  }
  generate_drill_plan(p: PlayerProfile) {
    return generatePlan(p);
  }
  record_issue(p: PlayerProfile, issue: string) {
    const normalized = normalizeIssue(issue);
    if (!normalized || normalized.length > 120)
      throw new Error("Use an issue description between 1 and 120 characters.");
    return this.save(
      {
        ...p,
        issueEvents: [
          ...p.issueEvents,
          { id: crypto.randomUUID(), issue: normalized, date: localDate() },
        ],
      },
      "A new issue observation was recorded",
    );
  }
  resolve_issue(p: PlayerProfile, id: string) {
    return this.save(
      { ...p, resolved: { ...p.resolved, [normalizeIssue(id)]: localDate() } },
      "You marked an issue resolved",
    );
  }
}
