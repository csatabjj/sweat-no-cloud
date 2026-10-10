import type { Exercise, Workout } from "./workout-store";
import { uid } from "./workout-store";

export type WorkoutTemplate = {
  id: string;
  day: string;
  name: string;
  focus: string;
  exercises: { name: string; sets: number; reps: string; weight?: string; rpe?: string; note?: string }[];
};

export const TEMPLATES: WorkoutTemplate[] = [
  {
    id: "pusha",
    day: "Hétfő",
    name: "Push A — mell + quad",
    focus: "Mell + quad — cél RPE 6",
    exercises: [
      { name: "Guggolás (high-bar)", sets: 3, reps: "6-8", rpe: "6", note: "öv nélkül" },
      { name: "Kézisúlyzós fekvenyomás", sets: 4, reps: "6-10" },
      { name: "Gépes mellnyomás", sets: 3, reps: "8-12" },
      { name: "Oldalemelés", sets: 3, reps: "12-20", note: "szuperszett a gépes mellnyomással" },
      { name: "Tricepsz letolás", sets: 4, reps: "10-15" },
      { name: "Leg extension", sets: 3, reps: "12-15", note: "szuperszett a tricepsz letolással" },
      { name: "Hamstring stretch", sets: 2, reps: "30 mp/oldal", note: "záró" },
      { name: "Reverse plank", sets: 2, reps: "30-45 mp", note: "záró" },
    ],
  },
  {
    id: "pulla",
    day: "Szerda",
    name: "Pull A — nehéz RDL + vertikális húzás",
    focus: "Nehéz RDL + vertikális húzás — RPE 7 max",
    exercises: [
      { name: "RDL", sets: 3, reps: "6-8", rpe: "7", note: "max, öv nélkül" },
      { name: "Húzódzkodás / lat pulldown", sets: 4, reps: "6-10" },
      { name: "Chest-supported row", sets: 3, reps: "8-12" },
      { name: "Bicepsz gép", sets: 4, reps: "8-12" },
      { name: "Face pull", sets: 3, reps: "12-15", note: "hátsó delta #1, szuperszett a bicepsszel" },
      { name: "Pallof press", sets: 2, reps: "10-12/oldal" },
      { name: "Hamstring stretch", sets: 2, reps: "30 mp/oldal", note: "záró" },
      { name: "Reverse plank", sets: 2, reps: "30-45 mp", note: "záró" },
    ],
  },
  {
    id: "pushb2",
    day: "Péntek",
    name: "Push B — váll + quad",
    focus: "Váll + quad — cél RPE 6",
    exercises: [
      { name: "Guggolás pause", sets: 3, reps: "8-10", rpe: "6" },
      { name: "Gépi mellnyomás", sets: 3, reps: "8-12" },
      { name: "Ülő vállnyomás (kézisúlyzó)", sets: 4, reps: "6-10" },
      { name: "Pec deck / kábeles tárogatás", sets: 3, reps: "10-15" },
      { name: "Oldalemelés", sets: 3, reps: "12-20" },
      { name: "Overhead tricepsz (kábel)", sets: 4, reps: "10-12" },
      { name: "Leg extension", sets: 3, reps: "12-15", note: "szuperszett az overhead tricepsszel" },
      { name: "Hamstring stretch", sets: 2, reps: "30 mp/oldal", note: "záró" },
      { name: "Reverse plank", sets: 2, reps: "30-45 mp", note: "záró" },
    ],
  },
  {
    id: "pullb",
    day: "Vasárnap",
    name: "Pull B — könnyű RDL + horizontális húzás",
    focus: "Könnyű RDL + horizontális húzás — RPE 6–7",
    exercises: [
      { name: "RDL", sets: 3, reps: "10-12", rpe: "6-7" },
      { name: "T-bar / chest-supported row", sets: 4, reps: "8-12" },
      { name: "Lat pulldown semleges fogással", sets: 3, reps: "8-12" },
      { name: "Ülő combhajlítás", sets: 3, reps: "10-15" },
      { name: "Reverse pec deck", sets: 3, reps: "12-15", note: "hátsó delta #2, szuperszett az incline bicepsszel" },
      { name: "Incline kézisúlyzós bicepsz", sets: 4, reps: "8-12" },
      { name: "Pallof press", sets: 2, reps: "10-12/oldal" },
      { name: "Hamstring stretch", sets: 2, reps: "30 mp/oldal", note: "záró" },
      { name: "Reverse plank", sets: 2, reps: "30-45 mp", note: "záró" },
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
    return {
      id: uid(),
      name: e.name,
      note: noteParts.join(" · "),
      sets: Array.from({ length: e.sets }, () => ({
        id: uid(),
        weight: w,
        reps: r,
        done: false,
      })),
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
