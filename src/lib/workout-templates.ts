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
      { name: "Tricepsz letolás", sets: 3, reps: "10-15" },
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
      { name: "Bicepsz gép", sets: 3, reps: "8-12" },
      { name: "Face pull", sets: 3, reps: "12-15", note: "hátsó delta #1, szuperszett a bicepsszel" },
      { name: "Pallof press", sets: 2, reps: "10-12/oldal" },
      { name: "Hamstring stretch", sets: 2, reps: "30 mp/oldal", note: "záró" },
      { name: "Reverse plank", sets: 2, reps: "30-45 mp", note: "záró" },
    ],
  },
  {
    id: "pushb",
    day: "Péntek",
    name: "Push B — váll + quad",
    focus: "Váll + quad — cél RPE 6",
    exercises: [
      { name: "Guggolás pause", sets: 3, reps: "8-10", rpe: "6" },
      { name: "Ülő vállnyomás (kézisúlyzó)", sets: 4, reps: "6-10" },
      { name: "Pec deck / kábeles tárogatás", sets: 3, reps: "10-15" },
      { name: "Oldalemelés", sets: 3, reps: "12-20" },
      { name: "Overhead tricepsz (kábel)", sets: 3, reps: "10-12", note: "szuperszett a vádlival" },
      { name: "Álló vádli", sets: 3, reps: "10-15" },
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
      { name: "Incline kézisúlyzós bicepsz", sets: 3, reps: "8-12" },
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

export function suggestedTemplateId(): string {
  // Mon=1, Wed=3, Fri=5, Sun=0
  const d = new Date().getDay();
  if (d <= 1) return "pusha";
  if (d <= 3) return "pulla";
  if (d <= 5) return "pushb";
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
