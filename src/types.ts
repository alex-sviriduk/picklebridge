import { z } from "zod";
export const sports = [
  "tennis",
  "badminton",
  "table-tennis",
  "racquetball",
  "other",
  "none",
] as const;
export const levels = [
  "new",
  "few-times",
  "beginner",
  "intermediate",
  "advanced",
] as const;
export const topics = [
  "kitchen",
  "volleys",
  "dinks",
  "drops",
  "resets",
  "transition",
  "serves",
  "returns",
  "drives",
  "hands",
  "consistency",
  "doubles",
] as const;
export type Topic = (typeof topics)[number];
export type Sport = (typeof sports)[number];
export const assessmentSchema = z.object({
  name: z.string().trim().min(1).max(60),
  sport: z.enum(sports),
  years: z.number().min(0).max(90),
  backgroundLevel: z.string().max(60),
  style: z.string().max(60),
  strengths: z.array(z.string().max(60)).max(12),
  handedness: z.enum(["right", "left"]),
  backhand: z.enum(["one-handed", "two-handed", "unknown"]),
  format: z.enum(["singles", "doubles", "both"]),
  netComfort: z.enum(["low", "medium", "high"]),
  topspin: z.boolean(),
  slice: z.boolean(),
  level: z.enum(levels),
  months: z.number().min(0).max(600),
  goals: z.array(z.string().max(80)).min(1).max(10),
  days: z.number().int().min(1).max(5),
});
export type Assessment = z.infer<typeof assessmentSchema>;
export const sessionSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  duration: z.number().int().min(5).max(360),
  kind: z.enum(["games", "drills", "mixed"]),
  format: z.enum(["singles", "doubles", "solo"]),
  good: z.string().max(1000),
  issues: z.array(z.string().min(1).max(120)).max(20),
  notes: z.string().max(2000),
  rating: z.number().int().min(1).max(5),
});
export type Session = z.infer<typeof sessionSchema>;
export const profileSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  assessment: assessmentSchema,
  sessions: z.array(sessionSchema),
  pinned: z.array(z.enum(topics)),
  dismissed: z.array(z.enum(topics)),
  resolved: z.record(z.string()),
  issueEvents: z.array(
    z.object({ id: z.string(), issue: z.string().max(120), date: z.string() }),
  ),
  focusHistory: z.array(
    z.object({
      date: z.string(),
      topics: z.array(z.enum(topics)),
      reason: z.string(),
    }),
  ),
  planRevision: z.number().int().min(0),
  chat: z
    .array(z.object({ role: z.enum(["user", "coach"]), text: z.string() }))
    .max(100),
});
export type PlayerProfile = z.infer<typeof profileSchema>;
export interface Transfer {
  name: string;
  strength:
    | "Strong transfer"
    | "Partial transfer"
    | "Needs adjustment"
    | "Mostly new skill";
  detail: string;
  adjustment: string;
}
export interface Habit {
  name: string;
  why: string;
  problem: string;
  cue: string;
  topic: Topic;
}
export interface Priority {
  topic: Topic;
  score: number;
  reason: string;
  pinned: boolean;
}
export interface Issue {
  id: string;
  label: string;
  count: number;
  status: "Observation" | "Emerging" | "Recurring";
  topic: Topic;
}
export interface Drill {
  id: string;
  name: string;
  topic: Topic;
  minutes: number;
  players: number;
  equipment: string;
  levels: (typeof levels)[number][];
  instructions: string[];
  target: string;
  cue: string;
  mistake: string;
  progression: string;
  tennis: string;
}
export interface CoachingContext {
  profile: Assessment;
  priorities: Priority[];
  issues: Issue[];
  recentSessions: Session[];
  habits: Habit[];
}
export interface CoachResponse {
  text: string;
  topic?: Topic;
  drillId?: string;
}
export interface CoachingEngine {
  respond(message: string, context: CoachingContext): Promise<CoachResponse>;
}
