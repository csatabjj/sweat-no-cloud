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
    id: "a",
    day: "Hétfő",
    name: "A — Nehéz (erő)",
    focus: "Squat cél ~85% / RPE 8",
    exercises: [
      { name: "High bar squat", sets: 4, reps: "3-4", weight: "100/90", rpe: "6" },
      { name: "RDL", sets: 3, reps: "8", weight: "90", rpe: "7" },
      { name: "Fekvenyomás", sets: 4, reps: "4", weight: "90,85", rpe: "8" },
      { name: "Melltámaszos evezés", sets: 4, reps: "8", weight: "130", rpe: "7" },
      { name: "Tárogatás", sets: 2, reps: "8-10", weight: "95", rpe: "7" },
      { name: "Tricepsz kötél", sets: 3, reps: "10-12", weight: "52", rpe: "7" },
      { name: "Combfeszítő", sets: 2, reps: "12", weight: "95", rpe: "8" },
      { name: "Oldalemelés gépen v csigán", sets: 2, reps: "10", weight: "14", rpe: "6" },
      { name: "Pallof press", sets: 2, reps: "10/oldal" },
    ],
  },
  {
    id: "b",
    day: "Szerda",
    name: "B — Hipertrófia",
    focus: "Volumen — cél RPE 7–8",
    exercises: [
      { name: "High bar squat", sets: 4, reps: "8", weight: "80", rpe: "6" },
      { name: "Nyomás egykezes / keret 30°", sets: 4, reps: "8", weight: "30/80", rpe: "8" },
      { name: "Szűk lehúzás", sets: 4, reps: "8", weight: "70", rpe: "7" },
      { name: "Combhajlítás ülve", sets: 2, reps: "15", rpe: "7", note: "gépszint 8" },
      { name: "Rear delts kábel", sets: 2, reps: "10", weight: "20", rpe: "7" },
      { name: "Oldalemelés gépen v csigán", sets: 2, reps: "10", weight: "14", rpe: "7" },
      { name: "Bicepsz – Scott", sets: 3, reps: "10", rpe: "7", note: "szint 6,5" },
      { name: "Pallof press", sets: 2, reps: "10/oldal" },
      { name: "Bird dog", sets: 2, reps: "6/oldal" },
    ],
  },
  {
    id: "a2",
    day: "Péntek",
    name: "A2 — Közepes (volumen-erő)",
    focus: "Squat cél ~80% / RPE 8",
    exercises: [
      { name: "High bar squat", sets: 4, reps: "5", weight: "87,5", rpe: "6" },
      { name: "RDL", sets: 2, reps: "8", weight: "90", rpe: "6" },
      { name: "Fekvenyomás", sets: 4, reps: "5", weight: "85/80", rpe: "7" },
      { name: "Melltámaszos evezés", sets: 4, reps: "8", weight: "130", rpe: "7" },
      { name: "Tárogatás", sets: 2, reps: "8-10", weight: "95", rpe: "7" },
      { name: "Tricepsz letolás", sets: 3, reps: "8", weight: "70", rpe: "7" },
      { name: "Oldalemelés gépen v csigán", sets: 2, reps: "10", weight: "14", rpe: "7", note: "csigán" },
      { name: "Pallof press", sets: 2, reps: "10/oldal", note: "csigán" },
      { name: "McGill curl-up", sets: 2, reps: "8" },
    ],
  },
  {
    id: "b2",
    day: "Vasárnap",
    name: "B2 — Hipertrófia",
    focus: "Volumen — cél RPE 7–8",
    exercises: [
      { name: "High bar squat", sets: 6, reps: "3", weight: "80", rpe: "6" },
      { name: "Nyomás egykezes / keret 30°", sets: 4, reps: "8-10", weight: "27,5/70", rpe: "8" },
      { name: "Szűk lehúzás", sets: 4, reps: "6-8", weight: "79", rpe: "8" },
      { name: "Combhajlítás ülve", sets: 2, reps: "15", rpe: "7", note: "gépszint 8" },
      { name: "Reverse pec", sets: 3, reps: "12", rpe: "7", note: "szint 6" },
      { name: "Oldalemelés gépen v csigán", sets: 2, reps: "10-12", weight: "14", rpe: "7" },
      { name: "Bicepsz kalapács", sets: 3, reps: "10-12", weight: "17,5", rpe: "7", note: "szint 7/8" },
      { name: "Combfeszítő", sets: 2, reps: "12", weight: "95", rpe: "8" },
      { name: "Dead bug", sets: 2, reps: "8/oldal", rpe: "7" },
      { name: "McGill curl-up", sets: 2, reps: "20 mp/oldal" },
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

export function suggestedTemplateId(): string {
  // Mon=1, Wed=3, Fri=5, Sun=0
  const d = new Date().getDay();
  if (d <= 1) return "a";
  if (d <= 3) return "b";
  if (d <= 5) return "a2";
  return "b2";
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
