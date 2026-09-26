import { describe, expect, it, vi } from "vitest";
import { defaultAssessment } from "../src/data/defaults";
import { createProfile, PlayerService } from "../src/lib/playerService";
import {
  buildContext,
  detectIssues,
  generatePlan,
  prioritiesFor,
  selectDrills,
} from "../src/lib/recommendations";
import { LocalPlayerRepository, STORAGE_KEY } from "../src/lib/persistence";
import { LocalCoachingEngine } from "../src/lib/coaching";
import { drills } from "../src/data/drills";
import { sports, topics, type Session, type Topic } from "../src/types";
const now = new Date("2026-09-24T12:00:00");
const profile = () =>
  createProfile({
    ...defaultAssessment,
    name: "Test player",
    level: "beginner",
  });
const session = (date: string, issues = ["dink-popups"]): Session => ({
  id: crypto.randomUUID(),
  date,
  duration: 45,
  kind: "games",
  format: "doubles",
  good: "Balanced contact",
  issues,
  notes: "Test session",
  rating: 3,
});
function storage() {
  const values = new Map<string, string>();
  return {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => {
      values.set(k, v);
    },
    removeItem: (k: string) => {
      values.delete(k);
    },
  };
}
describe("profile and repository", () => {
  it.each(sports)("creates a valid usable %s pathway", (sport) => {
    const p = createProfile({ ...defaultAssessment, name: "Player", sport });
    expect(prioritiesFor(p).length).toBeGreaterThan(3);
    expect(selectDrills(p).length).toBeGreaterThan(5);
    expect(p.sessions).toEqual([]);
  });
  it("rejects incomplete onboarding", () => {
    expect(() => createProfile(defaultAssessment)).toThrow();
  });
  it("round-trips profile and session data", () => {
    const repository = new LocalPlayerRepository(storage());
    const p = profile();
    p.sessions = [session("2026-09-23")];
    repository.save(p);
    expect(repository.load()).toEqual(p);
    repository.reset();
    expect(repository.load()).toBeNull();
  });
  it("reports corrupted data without overwriting it", () => {
    const store = storage();
    store.setItem(STORAGE_KEY, "not json");
    const repository = new LocalPlayerRepository(store);
    expect(() => repository.load()).toThrow("could not be read");
    expect(repository.raw()).toBe("not json");
  });
  it("rejects invalid nested stored data", () => {
    const store = storage();
    store.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        profile: { ...profile(), sessions: [{ date: "bad" }] },
      }),
    );
    expect(() => new LocalPlayerRepository(store).load()).toThrow();
  });
  it("does not report a failed write as success", () => {
    const store = storage();
    const repository = new LocalPlayerRepository({
      ...store,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    });
    expect(() => repository.save(profile())).toThrow("could not save");
    expect(repository.load()).toBeNull();
  });
});
describe("issue detection", () => {
  it("distinguishes observation, emerging and recurring", () => {
    const p = profile();
    for (let i = 1; i <= 3; i++) {
      p.sessions.push(session(`2026-09-${20 + i}`));
      const issue = detectIssues(p, now)[0];
      expect(issue.count).toBe(i);
      expect(issue.status).toBe(
        ["Observation", "Emerging", "Recurring"][i - 1],
      );
    }
  });
  it("counts duplicate issue entries once per session", () => {
    const p = profile();
    p.sessions = [session("2026-09-24", ["dink-popups", " DINK-POPUPS "])];
    expect(detectIssues(p, now)[0].count).toBe(1);
  });
  it("uses a 30-day inclusive window and ignores future sessions", () => {
    const p = profile();
    p.sessions = [
      session("2026-08-25"),
      session("2026-08-26"),
      session("2026-09-25"),
    ];
    expect(detectIssues(p, now)[0].count).toBe(1);
  });
  it("uses at most the latest ten sessions", () => {
    const p = profile();
    p.sessions = Array.from({ length: 12 }, (_, i) =>
      session(`2026-09-${String(10 + i).padStart(2, "0")}`),
    );
    expect(detectIssues(p, now)[0].count).toBe(10);
  });
  it("normalizes custom issues", () => {
    const p = profile();
    p.sessions = [
      session("2026-09-22", [" Lost   balance "]),
      session("2026-09-23", ["lost balance"]),
    ];
    expect(detectIssues(p, now)[0]).toMatchObject({
      count: 2,
      id: "lost balance",
      topic: "consistency",
    });
  });
  it("keeps resolution until a later-day observation", () => {
    const p = profile();
    p.sessions = [session("2026-09-22"), session("2026-09-23")];
    p.resolved["dink-popups"] = "2026-09-23";
    expect(detectIssues(p, now)).toEqual([]);
    p.sessions.push(session("2026-09-24"));
    expect(detectIssues(p, now)[0].count).toBe(1);
  });
  it("deduplicates same-day explicit issue notes", () => {
    const p = profile();
    p.issueEvents = [
      { id: "a", issue: "dink-popups", date: "2026-09-24" },
      { id: "b", issue: "dink-popups", date: "2026-09-24" },
    ];
    expect(detectIssues(p, now)[0].count).toBe(1);
  });
});
describe("adaptive recommendations", () => {
  it("leaves dismissed topics out of generated plans", () => {
    const p = profile();
    p.dismissed = ["dinks", "volleys", "drops"];
    expect(
      generatePlan(p)
        .flatMap((x) => x.drills)
        .some((d) => p.dismissed.includes(d.topic)),
    ).toBe(false);
  });
  it("elevates repeated dink problems over initial tennis priorities", () => {
    const p = profile();
    expect(prioritiesFor(p, now)[0].topic).toBe("kitchen");
    p.sessions = [session("2026-09-22"), session("2026-09-23")];
    expect(prioritiesFor(p, now)[0].topic).toBe("dinks");
    expect(prioritiesFor(p, now)[0].reason).toContain("2 recent observations");
  });
  it("honors manual pins and dismissals", () => {
    const p = profile();
    p.pinned = ["serves"];
    p.dismissed = ["kitchen"];
    expect(prioritiesFor(p, now)[0].topic).toBe("serves");
    expect(prioritiesFor(p, now).some((x) => x.topic === "kitchen")).toBe(
      false,
    );
  });
  it("changes priorities for background and goals", () => {
    const p = profile();
    const tennis = prioritiesFor(p, now);
    p.assessment.sport = "none";
    expect(prioritiesFor(p, now)[0].topic).toBe("serves");
    p.assessment.sport = "tennis";
    p.assessment.goals = ["Improve doubles strategy"];
    expect(
      prioritiesFor(p, now).find((x) => x.topic === "doubles")!.score,
    ).toBeGreaterThan(tennis.find((x) => x.topic === "doubles")!.score);
  });
  it("adjusts for tennis playing style and net comfort", () => {
    const p = profile();
    const baseline = prioritiesFor(p, now);
    p.assessment.style = "Baseline";
    p.assessment.netComfort = "low";
    for (const t of ["kitchen", "volleys"])
      expect(
        prioritiesFor(p, now).find((x) => x.topic === t)!.score,
      ).toBeGreaterThan(baseline.find((x) => x.topic === t)!.score);
  });
  it("selects matching drill topics", () => {
    const p = profile();
    expect(selectDrills(p, "dinks").every((d) => d.topic === "dinks")).toBe(
      true,
    );
    for (const t of topics)
      expect(selectDrills(p, t).length).toBeGreaterThan(0);
  });
  it("generates the requested days with valid unique drills and rotates on regeneration", () => {
    const p = profile();
    p.assessment.days = 5;
    const plan = generatePlan(p);
    expect(plan).toHaveLength(5);
    for (const day of plan) {
      expect(new Set(day.drills.map((d) => d.id)).size).toBe(day.drills.length);
      expect(day.drills.every((d) => drills.some((x) => x.id === d.id))).toBe(
        true,
      );
    }
    p.planRevision++;
    expect(generatePlan(p)).not.toEqual(plan);
  });
  it("constructs complete coaching context with the five most recent sessions", () => {
    const p = profile();
    p.sessions = Array.from({ length: 7 }, (_, i) =>
      session(`2026-09-${10 + i}`),
    );
    const context = buildContext(p);
    expect(context.profile).toEqual(p.assessment);
    expect(context.habits.length).toBeGreaterThan(0);
    expect(context.recentSessions).toHaveLength(5);
    expect(context.recentSessions[0].date).toBe("2026-09-16");
  });
});
describe("application service", () => {
  it("keeps one focus active", () => {
    const service = new PlayerService(new LocalPlayerRepository(storage()));
    const p = profile();
    p.dismissed = topics.filter((t) => t !== "dinks");
    expect(() => service.update_player_focus(p, "dinks", "dismiss")).toThrow(
      "at least one",
    );
  });
  it("records and resolves explicit observations through persistence", () => {
    const repository = new LocalPlayerRepository(storage());
    const service = new PlayerService(repository);
    let p = service.record_issue(profile(), "DINK-POPUPS");
    expect(service.get_recurring_issues(p)[0].count).toBe(1);
    p = service.resolve_issue(p, "dink-popups");
    expect(service.get_recurring_issues(p)).toEqual([]);
    expect(repository.load()).toEqual(p);
  });
  it("logs a session, recomputes focus and saves both atomically", () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    try {
      const repository = new LocalPlayerRepository(storage());
      const service = new PlayerService(repository);
      let p = service.save(profile());
      const oldFocus = p.focusHistory.at(-1)!.topics[0];
      p = service.log_session(p, session("2026-09-23"));
      p = service.log_session(p, session("2026-09-24"));
      expect(repository.load()).toEqual(p);
      expect(p.focusHistory.at(-1)!.topics[0]).toBe("dinks");
      expect(oldFocus).not.toBe("dinks");
    } finally {
      vi.useRealTimers();
    }
  });
  it("rejects invalid and future session dates", () => {
    const service = new PlayerService(new LocalPlayerRepository(storage()));
    expect(() =>
      service.log_session(profile(), session("2099-01-01")),
    ).toThrow();
    expect(() =>
      service.log_session(profile(), session("2026-02-31")),
    ).toThrow();
  });
  it("pinning restores a dismissed focus area", () => {
    const service = new PlayerService(new LocalPlayerRepository(storage()));
    let p = profile();
    p = service.update_player_focus(p, "dinks", "dismiss");
    p = service.update_player_focus(p, "dinks", "pin");
    expect(p.dismissed).not.toContain("dinks");
    expect(p.pinned).toContain("dinks");
  });
  it("preserves sessions when the assessment changes", () => {
    const service = new PlayerService(new LocalPlayerRepository(storage()));
    const p = profile();
    p.sessions = [session("2026-09-22")];
    const changed = service.save({
      ...p,
      assessment: { ...p.assessment, sport: "badminton" },
    });
    expect(changed.sessions).toEqual(p.sessions);
    expect(buildContext(changed).profile.sport).toBe("badminton");
  });
});
describe("local coaching", () => {
  it("does not match net inside unrelated words", async () => {
    const response = await new LocalCoachingEngine().respond(
      "Is internet access required?",
      buildContext(profile()),
    );
    expect(response.topic).toBeUndefined();
  });
  it.each([
    ["My dinks pop up", "dinks"],
    ["My third shot drops hit the net", "drops"],
    ["My drives go long", "drives"],
    ["How do I return?", "returns"],
    ["Compact volley backswing", "volleys"],
    ["How do I reset?", "resets"],
    ["Kitchen positioning", "kitchen"],
    ["Help my serve", "serves"],
    ["Doubles partner coverage", "doubles"],
  ] as [string, Topic][])(
    "routes %s to useful content",
    async (message, topic) => {
      const response = await new LocalCoachingEngine().respond(
        message,
        buildContext(profile()),
      );
      expect(response.topic).toBe(topic);
      expect(response.drillId).toBeTruthy();
      expect(response.text).toContain("NEXT SESSION");
      expect(response.text).toContain("Test player");
    },
  );
  it("uses a non-tennis connection for badminton", async () => {
    const p = profile();
    p.assessment.sport = "badminton";
    const response = await new LocalCoachingEngine().respond(
      "My dinks pop up",
      buildContext(p),
    );
    expect(response.text).toContain("badminton");
    expect(response.text).not.toContain("miniature groundstroke");
  });
  it("does not invent an answer to an unsupported question", async () => {
    const response = await new LocalCoachingEngine().respond(
      "What is the weather tomorrow?",
      buildContext(profile()),
    );
    expect(response.text).toContain("cannot reliably answer");
    expect(response.topic).toBeUndefined();
  });
});
