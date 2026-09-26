import type { Habit, Sport, Topic, Transfer } from "../types";
export const sportNames: Record<Sport, string> = {
  tennis: "Tennis",
  badminton: "Badminton",
  "table-tennis": "Table tennis",
  racquetball: "Racquetball",
  other: "Other racket sport",
  none: "New to racket sports",
};
export const topicNames: Record<Topic, string> = {
  kitchen: "Kitchen positioning",
  volleys: "Compact volleys",
  dinks: "Dink control",
  drops: "Third-shot drops",
  resets: "Soft resets",
  transition: "Transition movement",
  serves: "Reliable serves",
  returns: "Deep returns",
  drives: "Controlled drives",
  hands: "Hand speed",
  consistency: "Rally consistency",
  doubles: "Doubles teamwork",
};
export const goals = [
  "Play comfortably",
  "Improve consistency",
  "Learn kitchen play",
  "Transition from tennis habits",
  "Improve doubles strategy",
  "Prepare for leagues",
  "Tournament play",
  "Improve quickly",
];
export const problemCatalog: { id: string; label: string; topic: Topic }[] = [
  { id: "dink-popups", label: "Dinks popping up", topic: "dinks" },
  { id: "drops-high", label: "Third-shot drops too high", topic: "drops" },
  { id: "drops-net", label: "Drops going into the net", topic: "drops" },
  { id: "drives-long", label: "Drives going long", topic: "drives" },
  {
    id: "volley-backswing",
    label: "Volley backswing too large",
    topic: "volleys",
  },
  { id: "resets", label: "Struggling with resets", topic: "resets" },
  { id: "baseline", label: "Staying at the baseline", topic: "kitchen" },
  {
    id: "transition",
    label: "Poor transition-zone movement",
    topic: "transition",
  },
  { id: "early-attack", label: "Attacking too early", topic: "dinks" },
  { id: "backhand", label: "Weak backhand", topic: "volleys" },
  { id: "positioning", label: "Poor court positioning", topic: "doubles" },
  { id: "serve", label: "Serve inconsistency", topic: "serves" },
  { id: "return", label: "Return inconsistency", topic: "returns" },
];
const transfer = (
  name: string,
  strength: Transfer["strength"],
  detail: string,
  adjustment: string,
): Transfer => ({ name, strength, detail, adjustment });
export const transfers: Record<Sport, Transfer[]> = {
  tennis: [
    transfer(
      "Split step",
      "Strong transfer",
      "Reading contact and preparing your feet still pays off.",
      "Use small, frequent split steps; stabilize before the opponent strikes.",
    ),
    transfer(
      "Ball tracking & direction",
      "Strong transfer",
      "Your experience judging flight and aiming into space transfers.",
      "The plastic ball slows and bounces differently; recalibrate with cooperative rallies.",
    ),
    transfer(
      "Volley instincts",
      "Strong transfer",
      "You already read incoming balls and organize the racket face.",
      "Block and redirect with a short paddle motion instead of punching through.",
    ),
    transfer(
      "Topspin forehand",
      "Partial transfer",
      "Spin awareness helps shape a controlled drive.",
      "Reduce backswing; reserve drives for balanced contact and suitable height.",
    ),
    transfer(
      "Point construction",
      "Strong transfer",
      "Patience and reading opponents help you choose higher-percentage shots.",
      "Create a ball above net height before accelerating; power alone rarely solves kitchen play.",
    ),
    transfer(
      "Baseline rallying",
      "Needs adjustment",
      "Groundstroke consistency is useful during returns and passing attempts.",
      "In doubles, use a safe ball to advance together rather than camping at the baseline.",
    ),
    transfer(
      "Serve mechanics",
      "Needs adjustment",
      "Placement routines and repeatable targets remain useful.",
      "Learn pickleball-specific serve rules; a tennis overhead service action does not transfer.",
    ),
    transfer(
      "Dinks & resets",
      "Mostly new skill",
      "Touch experience is a starting point, not a complete soft game.",
      "Learn to absorb pace and land the ball in the kitchen with a quiet paddle.",
    ),
  ],
  badminton: [
    transfer(
      "Fast reactions",
      "Strong transfer",
      "Reading a fast exchange helps at the kitchen line.",
      "Keep the paddle in front and reduce wrist acceleration.",
    ),
    transfer(
      "Net touch",
      "Partial transfer",
      "You understand using soft placement to create space.",
      "Account for the bounce and let low balls rise before a controlled lift.",
    ),
    transfer(
      "Overhead coordination",
      "Partial transfer",
      "Tracking high balls supports overhead contact.",
      "Use measured placement; the paddle and ball respond differently.",
    ),
    transfer(
      "Bounce timing",
      "Mostly new skill",
      "Pickleball asks you to read a ball after it lands.",
      "Practice drop-hit rallies and move behind the bounce.",
    ),
  ],
  "table-tennis": [
    transfer(
      "Compact strokes",
      "Strong transfer",
      "Short preparation supports close-range exchanges.",
      "Leave a stable paddle face and finish toward your target.",
    ),
    transfer(
      "Spin awareness",
      "Partial transfer",
      "You recognize how spin changes contact and bounce.",
      "Use less wrist and learn how the plastic ball responds.",
    ),
    transfer(
      "Hand speed",
      "Strong transfer",
      "Quick recognition helps defend body shots.",
      "Stay relaxed rather than flicking every contact.",
    ),
    transfer(
      "Court coverage",
      "Mostly new skill",
      "A larger court introduces longer recovery distances.",
      "Move with your partner and use a split step before contact.",
    ),
  ],
  racquetball: [
    transfer(
      "Reaction speed",
      "Strong transfer",
      "Fast exchanges feel familiar.",
      "Use blocks to absorb pace instead of always accelerating.",
    ),
    transfer(
      "Low-ball contact",
      "Partial transfer",
      "Tracking a low bounce helps with retrieval.",
      "Lift patiently with an open face rather than driving through every low ball.",
    ),
    transfer(
      "Court positioning",
      "Needs adjustment",
      "Recovery habits need a new reference point.",
      "In doubles, recover with your partner near the kitchen rather than a central backcourt position.",
    ),
  ],
  other: [
    transfer(
      "Tracking & coordination",
      "Partial transfer",
      "Prior racket experience can help you find the ball consistently.",
      "Start with cooperative rallies to learn paddle distance and bounce.",
    ),
    transfer(
      "Stroke preparation",
      "Needs adjustment",
      "Familiar preparation may be larger than this court allows.",
      "Keep your paddle in front for short exchanges.",
    ),
    transfer(
      "Kitchen tactics",
      "Mostly new skill",
      "The non-volley zone creates a distinct tactical rhythm.",
      "Learn when to let the ball bounce and when to hold your position.",
    ),
  ],
  none: [
    transfer(
      "Balanced movement",
      "Mostly new skill",
      "Build a comfortable ready position before adding speed.",
      "Small steps, paddle in front, stop before contact.",
    ),
    transfer(
      "Ball contact",
      "Mostly new skill",
      "Consistent contact comes before complex spin or power.",
      "Watch the ball into a quiet paddle face.",
    ),
    transfer(
      "Court awareness",
      "Mostly new skill",
      "Learn the baseline, service areas and non-volley zone together.",
      "Start with serves, returns and cooperative short rallies.",
    ),
  ],
};
export const tennisHabits: Habit[] = [
  {
    name: "A full groundstroke backswing",
    why: "Tennis rewards a longer swing to generate pace.",
    problem: "Fast kitchen exchanges leave less preparation time.",
    cue: "Keep the paddle where you can see it.",
    topic: "volleys",
  },
  {
    name: "Staying at the baseline",
    why: "Baseline rallies are a familiar way to build a tennis point.",
    problem: "Opponents at the kitchen can control angles and your feet.",
    cue: "Earn your way forward behind a controlled ball.",
    topic: "kitchen",
  },
  {
    name: "Attacking below net height",
    why: "A short tennis ball often invites an attacking approach.",
    problem:
      "A low pickleball contact must first travel upward, offering a counterattack.",
    cue: "Low ball: lift. High ball: consider pressure.",
    topic: "dinks",
  },
  {
    name: "Driving every third shot",
    why: "A strong forehand feels like your most reliable weapon.",
    problem: "Pace alone may leave you pinned behind the kitchen team.",
    cue: "Choose the shot that buys you time to advance.",
    topic: "drops",
  },
  {
    name: "An active wrist at contact",
    why: "Racket-head acceleration helps generate tennis spin.",
    problem:
      "At short range it can change the paddle face and pop the ball up.",
    cue: "Quiet wrist, gentle lift from the shoulder.",
    topic: "dinks",
  },
  {
    name: "Punching through volleys",
    why: "Tennis volleys often use forward movement and a firm punch.",
    problem: "Too much travel sends a short-court volley long.",
    cue: "Meet, block, recover.",
    topic: "volleys",
  },
  {
    name: "Moving through every shot",
    why: "Approach shots encourage forward momentum.",
    problem: "Unstable contact makes resets harder.",
    cue: "Move between shots; settle for contact.",
    topic: "transition",
  },
  {
    name: "Finishing points too soon",
    why: "An open court or short ball can be a tennis finishing chance.",
    problem: "Speeding up a low ball can hand over an easy counter.",
    cue: "Build a better ball before adding pace.",
    topic: "dinks",
  },
];
export const startingPriorities: Record<Sport, Topic[]> = {
  tennis: ["kitchen", "volleys", "dinks", "drops", "resets", "transition"],
  badminton: ["dinks", "consistency", "resets", "kitchen", "returns"],
  "table-tennis": ["kitchen", "transition", "drops", "doubles", "serves"],
  racquetball: ["dinks", "kitchen", "resets", "volleys", "drops"],
  other: ["consistency", "kitchen", "dinks", "serves", "returns"],
  none: ["serves", "returns", "consistency", "kitchen", "dinks"],
};
export function habitsFor(sport: Sport): Habit[] {
  return sport === "tennis"
    ? tennisHabits
    : [
        {
          name:
            sport === "none" ? "Rushing the contact" : "Adding pace too soon",
          why:
            sport === "none"
              ? "New players often try to force the ball over."
              : `Your ${sportNames[sport].toLowerCase()} reactions may favor fast contact.`,
          problem: "Pace without a stable face reduces short-court control.",
          cue: "Balance first, aim second, swing small.",
          topic: "consistency",
        },
        {
          name: "Recovering to the wrong place",
          why: "Pickleball positioning takes practice in a new court.",
          problem: "Gaps between partners expose passing lanes.",
          cue: "Move together and pause before the next contact.",
          topic: "kitchen",
        },
      ];
}
