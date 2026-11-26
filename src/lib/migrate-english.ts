// One-time rename of previously saved Hungarian names/notes to English.
// Keeps all sets, weights and history intact; only text labels change.

const DONE_KEY = "lifttrack:english-names:v1";
const WORKOUTS_KEY = "lifttrack:workouts:v1";
const OVERRIDES_KEY = "lifttrack:template-overrides:v1";

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

const EXERCISES: Record<string, string> = {
  "Hack guggolás": "Hack Squat",
  "Gépes mellnyomás": "Machine Chest Press",
  "Gépes nyomás": "Machine Press",
  "Gépi mellnyomás": "Machine Chest Press",
  "Fekve nyomás gépen": "Machine Chest Press",
  "30 fokos nyomás gépen": "Incline Machine Press",
  "Mellnyomás 30 fok keret": "Incline Press (Smith Machine)",
  "Oldalemelés kábel": "Cable Lateral Raise",
  "Oldalemelés": "Lateral Raise",
  "Tricepsz egykezes keresztbe": "Single-Arm Cross-Body Triceps Pushdown",
  "Tricepsz kötél": "Rope Triceps Pushdown",
  "Tricepsz letolás": "Triceps Pushdown",
  "Tricepsz lenyomás": "Triceps Pushdown",
  "Tricepsz lenyomás egykezes": "Single-Arm Triceps Pushdown",
  "Váll nyomás kézi 2x": "Dumbbell Shoulder Press",
  "Vállnyomás kézi 2x": "Dumbbell Shoulder Press",
  "Ülő vállnyomás (kézisúlyzó)": "Seated Dumbbell Shoulder Press",
  "Leg extensions": "Leg Extension",
  "Leg extension": "Leg Extension",
  "Tárogatás gépen": "Machine Chest Fly",
  "Pec deck / kábeles tárogatás": "Pec Deck / Cable Fly",
  "Dip": "Dip",
  "Lábtoló gép": "Leg Press",
  "Guggolás (high-bar)": "High-Bar Squat",
  "Guggolás pause": "Pause Squat",
  "Kézisúlyzós fekvenyomás": "Dumbbell Bench Press",
  "Lat pulldown szűk": "Close-Grip Lat Pulldown",
  "Lat pulldown wide": "Wide-Grip Lat Pulldown",
  "Lat pulldown wide and narrow": "Wide and Narrow Lat Pulldown",
  "Lat pulldown semleges fogással": "Neutral-Grip Lat Pulldown",
  "Lat pulldown": "Lat Pulldown",
  "Széles lehúzás": "Wide-Grip Lat Pulldown",
  "Húzódzkodás / lat pulldown": "Pull-Up / Lat Pulldown",
  "Pull over rope egykezes": "Single-Arm Rope Pullover",
  "Lábhajlítás ülve": "Seated Leg Curl",
  "Ülő combhajlítás": "Seated Leg Curl",
  "Chest-supported row / T-Rúd": "Chest-Supported T-Bar Row",
  "Chest-supported row": "Chest-Supported Row",
  "T-bar / chest-supported row": "T-Bar Row / Chest-Supported Row",
  "Bicepsz gép csigás": "Cable Biceps Curl",
  "Bicepsz gép Scott vs Cable": "Machine Biceps Curl (Scott) / Cable Curl",
  "Bicepsz gép": "Machine Biceps Curl",
  "Bicepsz csigás hammer curl vs Bayasian": "Cable Hammer Curl / Bayesian Curl",
  "Bicepsz curl gépen vs hammer curl": "Machine Biceps Curl / Hammer Curl",
  "Incline kézisúlyzós bicepsz": "Incline Dumbbell Curl",
  "Egykezes evezés csiga/dumbell": "Single-Arm Cable / Dumbbell Row",
  "Egykezes evezés csiga térden/dumbell": "Single-Arm Row (Kneeling Cable / Dumbbell)",
  "Bayasian curl": "Bayesian Curl",
  "Reverse pec deck": "Reverse Pec Deck",
  "Reverse plank": "Reverse Plank",
  "Hamstring stretch": "Hamstring Stretch",
  "Face pull": "Face Pull",
  "Pallof press": "Pallof Press",
};

const WORKOUT_NAMES: Record<string, string> = {
  "Push A — mell + quad": "Push A — Chest + Quads",
  "Pull A — nehéz RDL + vertikális húzás": "Pull A — Heavy RDL + Vertical Pull",
  "Push B — váll + quad": "Push B — Shoulders + Quads",
  "Pull B — könnyű RDL + horizontális húzás": "Pull B — Light RDL + Horizontal Pull",
};

const EX_MAP = new Map(Object.entries(EXERCISES).map(([k, v]) => [norm(k), v]));
const WO_MAP = new Map(Object.entries(WORKOUT_NAMES).map(([k, v]) => [norm(k), v]));

const NOTE_REPLACEMENTS: [RegExp, string][] = [
  [/(\d) ism\b/g, "$1 reps"],
  [/szuperszett a gépes mellnyomással/g, "superset with machine chest press"],
  [/szuperszett a tricepsz letolással/g, "superset with triceps pushdown"],
  [/szuperszett az overhead tricepsszel/g, "superset with overhead triceps"],
  [/szuperszett az incline bicepsszel/g, "superset with incline curl"],
  [/szuperszett a bicepsszel/g, "superset with biceps"],
  [/szuperszett/g, "superset"],
  [/hátsó delta/g, "rear delts"],
  [/öv nélkül/g, "no belt"],
  [/gépszint/g, "machine level"],
  [/csigán/g, "on cable"],
  [/záró/g, "finisher"],
];

function fixNote(note: unknown) {
  if (typeof note !== "string") return note;
  return NOTE_REPLACEMENTS.reduce((acc, [re, to]) => acc.replace(re, to), note);
}

function fixExercises(list: unknown) {
  if (!Array.isArray(list)) return list;
  return list.map((e) => {
    if (!e || typeof e !== "object") return e;
    const ex = e as { name?: string; note?: string };
    const name = typeof ex.name === "string" ? (EX_MAP.get(norm(ex.name)) ?? ex.name) : ex.name;
    return { ...ex, name, note: fixNote(ex.note) };
  });
}

export function migrateToEnglish() {
  try {
    if (localStorage.getItem(DONE_KEY)) return;

    const rawWorkouts = localStorage.getItem(WORKOUTS_KEY);
    if (rawWorkouts) {
      const workouts = JSON.parse(rawWorkouts);
      if (Array.isArray(workouts)) {
        const next = workouts.map((w) => ({
          ...w,
          name: typeof w.name === "string" ? (WO_MAP.get(norm(w.name)) ?? w.name) : w.name,
          exercises: fixExercises(w.exercises),
        }));
        localStorage.setItem(WORKOUTS_KEY, JSON.stringify(next));
      }
    }

    const rawOverrides = localStorage.getItem(OVERRIDES_KEY);
    if (rawOverrides) {
      const overrides = JSON.parse(rawOverrides) as Record<string, unknown>;
      const next = Object.fromEntries(Object.entries(overrides).map(([id, list]) => [id, fixExercises(list)]));
      localStorage.setItem(OVERRIDES_KEY, JSON.stringify(next));
    }

    localStorage.setItem(DONE_KEY, "1");
  } catch {
    // leave data untouched if anything is unreadable
  }
}
