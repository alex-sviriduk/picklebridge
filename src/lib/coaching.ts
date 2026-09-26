import type { CoachingContext, CoachingEngine, CoachResponse } from "../types";
import { coachingContent, backgroundConnection } from "../data/coaching";
import { drills } from "../data/drills";
import { topicNames } from "../data/knowledge";
export class LocalCoachingEngine implements CoachingEngine {
  async respond(message: string, c: CoachingContext): Promise<CoachResponse> {
    const input = message.toLowerCase();
    const matches = coachingContent
      .map((content) => ({
        content,
        score:
          content.terms.reduce(
            (sum, term) =>
              sum +
              (new RegExp(`\\b${term}(?:s|ing)?\\b`).test(input)
                ? term.length
                : 0),
            0,
          ) +
          (content.topic === "kitchen" && input.includes("kitchen") ? 12 : 0),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);
    const content = matches[0]?.content;
    if (!content)
      return {
        text: `I can help with dinks, drops, drives, resets, volleys, serves, returns and positioning. I use local coaching rules, so I cannot reliably answer that question yet.\n\nYour current focus is ${c.priorities[0] ? topicNames[c.priorities[0].topic].toLowerCase() : "building consistent contact"}. Tell me the shot, where the ball went, and what you were trying to do.`,
      };
    const drill = drills.find(
      (d) => d.topic === content.topic && d.levels.includes(c.profile.level),
    )!;
    const related = c.issues.filter((i) => i.topic === content.topic);
    const priority = c.priorities.find((p) => p.topic === content.topic);
    const last = c.recentSessions[0];
    const context = [
      `For you: ${c.profile.name}, ${c.profile.level.replace("-", " ")} level. Your goals include ${c.profile.goals.slice(0, 2).join(" and ").toLowerCase()}.`,
      related.length
        ? `Your logs include ${related.map((i) => `${i.label.toLowerCase()} (${i.count} recent observations)`).join(", ")}.`
        : last
          ? `Your latest logged session was ${last.date}; this topic has no active repeated observation yet.`
          : "You have no session history yet; this suggestion starts from your assessment.",
      priority
        ? `Why practice this: ${priority.reason}`
        : "Try this as a focused experiment, then log what happens.",
    ].join(" ");
    return {
      topic: content.topic,
      drillId: drill.id,
      text: `LIKELY CAUSE\n${content.cause}\n\nTRANSLATE YOUR GAME\n${c.profile.sport === "tennis" ? content.analogy : backgroundConnection[c.profile.sport]}${c.profile.sport === "tennis" && c.profile.strengths.length ? ` You named ${c.profile.strengths.join(", ").toLowerCase()} as strengths; keep those assets while changing this contact pattern.` : ""}\n\nONE CUE\n${content.cue}\n\nTRY THIS DRILL · ${drill.minutes} MIN\n${drill.name}. ${drill.instructions.join(" ")} Target: ${drill.target}\n\nNEXT SESSION\n${content.watch}\n\n${context}`,
    };
  }
}
// A future server adapter implements CoachingEngine. No API key belongs in this bundle.
export const coachingEngine: CoachingEngine = new LocalCoachingEngine();
