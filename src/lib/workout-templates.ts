import type { Exercise, Workout } from "./workout-store";
import { uid } from "./workout-store";

export type WorkoutTemplate = {
  id: string;
  day: string;
  name: string;
  focus: string;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    weight?: string;
    rpe?: string;
    note?: string;
    // Per-set reps/weight, for exercises that ramp (e.g. pyramid sets).
    // When present, this takes priority over sets/reps/weight above.
    setDetails?: { reps: number; weight: number }[];
  }[];
};

export const TEMPLATES: WorkoutTemplate[] = [
  {
    id: "pusha",
    day: "Hétfő",
    name: "Push A — mell + quad",
    focus: "Mell + quad",
    exercises: [
      { name: "Hack Squat", sets: 4, reps: "12", weight: "50", note: "öv nélkül" },
      {
        name: "Machine Chest Press",
        sets: 5,
        reps: "8-10",
        setDetails: [
          { reps: 10, weight: 85 },
          { reps: 8, weight: 100 },
          { reps: 8, weight: 100 },
          { reps: 8, weight: 100 },
          { reps: 8, weight: 100 },
        ],
      },
      { name: "Cable Lateral Raise", sets: 5, reps: "12", weight: "12.5", note: "szuperszett a gépes mellnyomással" },
      { name: "Single-Arm Cross-Body Triceps Pushdown", sets: 4, reps: "10", weight: "61" },
      { name: "Rope Triceps Pushdown", sets: 4, reps: "" },
      { name: "Dumbbell Shoulder Press", sets: 4, reps: "12" },
      { name: "Leg Extension", sets: 5, reps: "12", weight: "85" },
      { name: "Machine Chest Fly", sets: 5, reps: "" },
    ],
  },
  {
    id: "pulla",
    day: "Szerda",
    name: "Pull A — nehéz RDL + vertikális húzás",
    focus: "Nehéz RDL + vertikális húzás",
    exercises: [
      {
        name: "RDL",
        sets: 3,
        reps: "8-10",
        setDetails: [
          { reps: 10, weight: 80 },
          { reps: 10, weight: 80 },
          { reps: 8, weight: 90 },
        ],
        note: "max, öv nélkül",
      },
      { name: "Close-Grip Lat Pulldown", sets: 4, reps: "10", weight: "61" },
      { name: "Single-Arm Rope Pullover", sets: 4, reps: "" },
      { name: "Seated Leg Curl", sets: 5, reps: "12", weight: "7", note: "7" },
      {
        name: "Chest-Supported T-Bar Row",
        sets: 4,
        reps: "6-12",
        setDetails: [
          { reps: 12, weight: 115 },
          { reps: 8, weight: 130 },
          { reps: 8, weight: 130 },
          { reps: 6, weight: 145 },
        ],
      },
      { name: "Cable Biceps Curl", sets: 4, reps: "10", weight: "5" },
      { name: "Single-Arm Cable / Dumbbell Row", sets: 4, reps: "10", weight: "43" },
      { name: "Bayesian Curl", sets: 4, reps: "" },
    ],
  },
  {
    id: "pushb2",
    day: "Péntek",
    name: "Push B — váll + quad",
    focus: "Váll + quad",
    exercises: [
      { name: "Hack Squat", sets: 4, reps: "12", weight: "60" },
      { name: "Machine Press", sets: 5, reps: "10", weight: "60" },
      { name: "Cable Lateral Raise", sets: 5, reps: "12", weight: "12.5" },
      { name: "Pec Deck / Cable Fly", sets: 5, reps: "10", weight: "65" },
      { name: "Cable Overhead Triceps Extension", sets: 4, reps: "10", weight: "43" },
      { name: "Single-Arm Triceps Pushdown", sets: 4, reps: "" },
      { name: "Leg Extension", sets: 5, reps: "12", weight: "85" },
      { name: "Dumbbell Shoulder Press", sets: 4, reps: "12" },
    ],
  },
  {
    id: "pullb",
    day: "Vasárnap",
    name: "Pull B — könnyű RDL + horizontális húzás",
    focus: "Könnyű RDL + horizontális húzás",
    exercises: [
      {
        name: "RDL",
        sets: 3,
        reps: "8-10",
        setDetails: [
          { reps: 10, weight: 80 },
          { reps: 10, weight: 80 },
          { reps: 8, weight: 90 },
        ],
      },
      { name: "Close-Grip Lat Pulldown", sets: 4, reps: "" },
      { name: "Single-Arm Rope Pullover", sets: 4, reps: "12", weight: "61" },
      {
        name: "Seated Leg Curl",
        sets: 5,
        reps: "12-15",
        setDetails: [
          { reps: 15, weight: 7 },
          { reps: 15, weight: 7 },
          { reps: 15, weight: 7 },
          { reps: 15, weight: 7 },
          { reps: 12, weight: 7 },
        ],
      },
      { name: "T-Bar Row / Chest-Supported Row", sets: 4, reps: "8", weight: "130" },
      { name: "Cable Hammer Curl / Bayesian Curl", sets: 4, reps: "10", weight: "43" },
      { name: "Single-Arm Row (Kneeling Cable / Dumbbell)", sets: 4, reps: "10", weight: "43" },
      { name: "Bayesian Curl", sets: 4, reps: "" },
      { name: "Reverse Pec Deck", sets: 4, reps: "12", weight: "7" },
    ],
  },
];

function parseFirstNumber(s?: string): number {
  if (!s) return 0;
  const m = s.replace(",", ".").match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : 0;
}
function parseFirstInt(s: string): number {
  const m = s.match(/\d+/);
  return m ? Number(m[0]) : 0;
}

export function templateToExercises(t: WorkoutTemplate): Exercise[] {
  return t.exercises.map((e) => {
    const w = parseFirstNumber(e.weight);
    const r = parseFirstInt(e.reps);
    const noteParts = [
      e.reps ? `${e.reps} ism` : null,
      e.rpe ? `RPE ${e.rpe}` : null,
      e.note,
    ].filter(Boolean);
    const sets = e.setDetails
      ? e.setDetails.map((sd) => ({ id: uid(), weight: sd.weight, reps: sd.reps, done: false }))
      : Array.from({ length: e.sets }, () => ({ id: uid(), weight: w, reps: r, done: false }));
    return {
      id: uid(),
      name: e.name,
      note: noteParts.join(" · "),
      sets,
    };
  });
}

/**
 * Clone exercises (fresh ids, all sets reset to not-done) — used when starting
 * a workout from a saved planning override.
 */
export function cloneExercisesFresh(exercises: Exercise[]): Exercise[] {
  return exercises.map((e) => ({
    ...e,
    id: uid(),
    sets: e.sets.map((s) => ({ ...s, id: uid(), done: false })),
  }));
}

/**
 * Get the exercises to start with for a template, applying any saved override.
 */
export function getTemplateExercises(
  t: WorkoutTemplate,
  overrides?: Record<string, Exercise[]>,
): Exercise[] {
  const override = overrides?.[t.id];
  if (override && override.length > 0) return cloneExercisesFresh(override);
  return templateToExercises(t);
}

/**
 * Format a set list as compact text: "3×8 @ 50kg", or per-set if they differ.
 */
function formatSets(sets: { weight: number; reps: number }[]): string {
  if (sets.length === 0) return "–";
  const allSame = sets.every((s) => s.reps === sets[0].reps && s.weight === sets[0].weight);
  if (allSame) {
    const { reps, weight } = sets[0];
    return weight > 0 ? `${sets.length}×${reps} @ ${weight}kg` : `${sets.length}×${reps}`;
  }
  return sets.map((s) => (s.weight > 0 ? `${s.reps}@${s.weight}kg` : `${s.reps}`)).join(", ");
}

/**
 * Build a plain-text summary of all templates, applying any saved overrides,
 * so the current plan (including on-device customizations) can be copied/shared.
 */
export function buildPlanText(overrides: Record<string, Exercise[]>): string {
  const lines: string[] = ["LiftTrack — jelenlegi edzésterv", ""];
  for (const t of TEMPLATES) {
    const override = overrides[t.id];
    lines.push(`${t.day} — ${t.name}${override ? " (egyéni mentett verzió)" : ""}`);
    if (override && override.length > 0) {
      for (const e of override) {
        lines.push(`- ${e.name}: ${formatSets(e.sets)}${e.note ? ` — ${e.note}` : ""}`);
      }
    } else {
      for (const e of t.exercises) {
        const parts = [`${e.sets}×${e.reps}`];
        if (e.rpe) parts.push(`RPE ${e.rpe}`);
        lines.push(`- ${e.name}: ${parts.join(", ")}${e.note ? ` — ${e.note}` : ""}`);
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function suggestedTemplateId(): string {
  // Mon=1, Wed=3, Fri=5, Sun=0
  const d = new Date().getDay();
  if (d <= 1) return "pusha";
  if (d <= 3) return "pulla";
  if (d <= 5) return "pushb2";
  return "pullb";
}

/**
 * Find the most recent finished workout that matches this template (by name).
 */
export function findLastWorkoutForTemplate(
  workouts: Workout[],
  templateName: string,
): Workout | undefined {
  return [...workouts]
    .filter((w) => w.finishedAt && w.name === templateName)
    .sort((a, b) => (b.finishedAt ?? "").localeCompare(a.finishedAt ?? ""))
    .at(0);
}

/**
 * Override per-set weight/reps with the values done in the previous session,
 * so the user starts from their last achieved numbers and pushes for a new record.
 * Matches exercises by name (case-insensitive, trimmed), and sets by index.
 * Only inherits from sets that were marked done.
 */
export function applyPreviousWorkout(exercises: Exercise[], prev?: Workout): Exercise[] {
  if (!prev) return exercises;
  const key = (s: string) => s.trim().toLowerCase();
  const prevByName = new Map<string, Exercise>();
  for (const e of prev.exercises) prevByName.set(key(e.name), e);

  return exercises.map((ex) => {
    const p = prevByName.get(key(ex.name));
    if (!p) return ex;
    const doneSets = p.sets.filter((s) => s.done);
    if (doneSets.length === 0) return ex;
    const fallback = doneSets[doneSets.length - 1];
    return {
      ...ex,
      sets: ex.sets.map((s, i) => {
        const prevSet = doneSets[i] ?? fallback;
        return { ...s, weight: prevSet.weight, reps: prevSet.reps };
      }),
    };
  });
}
