import type { Sport, Topic } from "../types";
export interface CoachingContent {
  topic: Topic;
  terms: string[];
  cause: string;
  cue: string;
  watch: string;
  analogy: string;
}
export const coachingContent: CoachingContent[] = [
  {
    topic: "dinks",
    terms: [
      "dink",
      "pop up",
      "pop-up",
      "popping",
      "wrist",
      "short ball",
      "attack too",
      "attacking too",
      "attack every",
    ],
    cause:
      "A changing paddle face, rushed contact or too much forward swing can lift a low ball into an easy attack. Without watching you play, these are possibilities to test.",
    cue: "Let the ball bounce, create space with your feet, and lift gently with a quiet wrist.",
    watch:
      "Count controlled dinks that land softly versus balls your partner could attack.",
    analogy:
      "A dink is closer to a controlled touch exchange than a miniature groundstroke. A short ball below net height is not automatically an approach-shot invitation.",
  },
  {
    topic: "drops",
    terms: ["drop", "third", "3rd", "approach"],
    cause:
      "A rushed swing or low trajectory can send a drop into the net; too much acceleration can leave it high. Aim for a descending ball with margin.",
    cue: "Start balanced, use a gentle arc, and judge where the ball lands rather than how narrowly it clears the net.",
    watch:
      "Track how many of 10 drops land in the kitchen and allow a balanced next step.",
    analogy:
      "Think of a third-shot drop as an approach-enabling shot. Unlike a hard tennis approach, its softness can buy time to move forward.",
  },
  {
    topic: "drives",
    terms: ["drive", "forehand", "topspin", "long", "sailing"],
    cause:
      "A large swing, open face or late contact may send the ball long. First reduce pace and establish a repeatable contact point.",
    cue: "Compact preparation, balanced contact, generous court margin.",
    watch: "Record depth and control at comfortable speed before adding pace.",
    analogy:
      "Keep your topspin knowledge, but scale down the tennis forehand. A drive can create a softer next ball; it does not need to finish the point.",
  },
  {
    topic: "resets",
    terms: ["reset", "absorb", "soften", "defend"],
    cause:
      "A firm grip or added forward swing can return incoming pace instead of absorbing it.",
    cue: "Soften the grip and let a stable paddle face receive the ball.",
    watch:
      "Notice whether the ball lands softly enough to prevent an easy attack.",
    analogy:
      "This is closer to taking pace off a delicate defensive volley than hitting through a passing shot.",
  },
  {
    topic: "volleys",
    terms: ["volley", "backswing", "backhand", "punch"],
    cause:
      "A long preparation or follow-through costs time and can send a short-court volley long.",
    cue: "Meet the ball in front, block toward a target, and recover the paddle immediately.",
    watch: "Count contacts where the paddle stays in your peripheral vision.",
    analogy:
      "Keep tennis volley recognition and positioning. Replace the big punch with a much shorter block. Your backhand grip should let the face stay stable.",
  },
  {
    topic: "serves",
    terms: ["serve", "service"],
    cause: "Changing tempo or chasing power makes a serve harder to repeat.",
    cue: "Choose a generous target, use a consistent pre-serve routine, and prioritize legal contact and placement.",
    watch: "Track serves in out of 10, then track depth separately.",
    analogy:
      "Transfer your tennis serving routine and target selection, not the overhead service mechanics.",
  },
  {
    topic: "returns",
    terms: ["return"],
    cause:
      "A rushed or shallow return gives the serving team less pressure and you less recovery time.",
    cue: "Send a controlled return deep with margin and settle before the next contact.",
    watch: "Count deep returns followed by a balanced ready position.",
    analogy:
      "Keep the reliable tennis return, but in doubles use its flight time to approach with control.",
  },
  {
    topic: "kitchen",
    terms: ["kitchen", "baseline", "non-volley", "nvz"],
    cause:
      "Staying back by habit can give the opposing kitchen team control. Charging forward behind a weak ball can also expose your feet.",
    cue: "Use the quality of your shot to decide when to advance, then stop before the next contact.",
    watch: "Notice whether you arrive balanced and together with your partner.",
    analogy:
      "The kitchen line is a useful doubles home base, but the non-volley zone limits where you can volley. You may enter it for a bounced ball; volley momentum must not carry you into it.",
  },
  {
    topic: "transition",
    terms: ["transition", "footwork", "feet", "moving", "split step"],
    cause:
      "Running during contact or taking oversized steps makes low shots harder to control.",
    cue: "Move between contacts; split step as the opponent strikes and hit from balance.",
    watch: "Count balanced contacts while moving from baseline toward kitchen.",
    analogy:
      "Keep your tennis split step but use shorter, more frequent movement cycles during the approach.",
  },
  {
    topic: "doubles",
    terms: ["doubles", "partner", "positioning", "middle"],
    cause:
      "Partners at different depths or without a middle-ball agreement can leave easy gaps.",
    cue: "Call early, shift together, and agree who takes middle balls.",
    watch:
      "Discuss one positioning gap and one good coordinated movement after a game.",
    analogy:
      "Instead of fixed tennis net-player and baseline-player roles, both partners often seek coordinated kitchen coverage.",
  },
  {
    topic: "hands",
    terms: ["hand speed", "reaction", "fast exchange"],
    cause:
      "Excessive tension and a paddle that drops after contact can slow the next response.",
    cue: "Recover to a compact ready position and keep exchanges controlled.",
    watch: "Count cooperative contacts before increasing speed.",
    analogy:
      "Recognize and block as in tennis reflex volleys, but with even less paddle travel.",
  },
  {
    topic: "consistency",
    terms: ["consistent", "consistency", "net", "miss", "rally", "control"],
    cause:
      "Changing swing speed, contact distance or balance from shot to shot makes misses difficult to diagnose.",
    cue: "Choose one comfortable target and repeat the same compact contact.",
    watch:
      "Track rally length and one specific miss pattern instead of judging the entire session.",
    analogy:
      "Treat this like cooperative mini-tennis: build dependable contact before adding pace or angles.",
  },
];
export const backgroundConnection: Record<Sport, string> = {
  tennis:
    "Keep the useful tennis reading and footwork, but scale down swing size.",
  badminton:
    "Your badminton reactions help; let the ball bounce when needed and reduce wrist acceleration with the paddle.",
  "table-tennis":
    "Your compact table-tennis preparation helps; use your feet to cover the larger court rather than reaching.",
  racquetball:
    "Your racquetball reactions help; choose soft placement instead of automatically returning pace.",
  other:
    "Use your racket-sport tracking experience while recalibrating bounce, paddle distance and court positioning.",
  none: "Begin with a balanced ready position and quiet paddle face. You do not need prior racket technique.",
};
