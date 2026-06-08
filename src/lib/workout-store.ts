import { useEffect, useState, useCallback } from "react";

export type SetEntry = { id: string; weight: number; reps: number; done: boolean };
export type Exercise = { id: string; name: string; sets: SetEntry[]; note?: string };
export type Workout = {
  id: string;
  date: string; // ISO
  name: string;
  exercises: Exercise[];
  finishedAt?: string;
};

const KEY = "lifttrack:workouts:v1";

function read(): Workout[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Workout[]) : [];
  } catch {
    return [];
  }
}

function write(workouts: Workout[]) {
  localStorage.setItem(KEY, JSON.stringify(workouts));
  window.dispatchEvent(new Event("lifttrack:update"));
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    setWorkouts(read());
    const handler = () => setWorkouts(read());
    window.addEventListener("lifttrack:update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("lifttrack:update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const save = useCallback((next: Workout[]) => {
    write(next);
    setWorkouts(next);
  }, []);

  return { workouts, save };
}

export function newWorkout(name = "Edzés"): Workout {
  return {
    id: uid(),
    date: new Date().toISOString(),
    name,
    exercises: [],
  };
}

// --- Template overrides (planning mode) ---

export type TemplateOverrides = Record<string, Exercise[]>;

const TKEY = "lifttrack:template-overrides:v1";

function readOverrides(): TemplateOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TKEY);
    return raw ? (JSON.parse(raw) as TemplateOverrides) : {};
  } catch {
    return {};
  }
}

function writeOverrides(o: TemplateOverrides) {
  localStorage.setItem(TKEY, JSON.stringify(o));
  window.dispatchEvent(new Event("lifttrack:templates-update"));
}

export function useTemplateOverrides() {
  const [overrides, setOverrides] = useState<TemplateOverrides>({});

  useEffect(() => {
    setOverrides(readOverrides());
    const handler = () => setOverrides(readOverrides());
    window.addEventListener("lifttrack:templates-update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("lifttrack:templates-update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const saveOverride = useCallback((templateId: string, exercises: Exercise[]) => {
    const next = { ...readOverrides(), [templateId]: exercises };
    writeOverrides(next);
    setOverrides(next);
  }, []);

  const resetOverride = useCallback((templateId: string) => {
    const cur = readOverrides();
    delete cur[templateId];
    writeOverrides(cur);
    setOverrides(cur);
  }, []);

  return { overrides, saveOverride, resetOverride };
}
