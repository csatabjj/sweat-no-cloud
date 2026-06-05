import { useState } from "react";
import { Check, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Workout, Exercise } from "@/lib/workout-store";
import { uid } from "@/lib/workout-store";

type Props = {
  workout: Workout;
  onChange: (w: Workout) => void;
  onFinish: () => void;
  onCancel: () => void;
};

export function ActiveWorkout({ workout, onChange, onFinish, onCancel }: Props) {
  const [exerciseName, setExerciseName] = useState("");

  const addExercise = () => {
    const name = exerciseName.trim();
    if (!name) return;
    const ex: Exercise = {
      id: uid(),
      name,
      sets: [{ id: uid(), weight: 0, reps: 0, done: false }],
    };
    onChange({ ...workout, exercises: [...workout.exercises, ex] });
    setExerciseName("");
  };

  const updateExercise = (id: string, patch: Partial<Exercise>) => {
    onChange({
      ...workout,
      exercises: workout.exercises.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    });
  };

  const removeExercise = (id: string) => {
    onChange({ ...workout, exercises: workout.exercises.filter((e) => e.id !== id) });
  };

  const addSet = (ex: Exercise) => {
    const last = ex.sets[ex.sets.length - 1];
    updateExercise(ex.id, {
      sets: [
        ...ex.sets,
        {
          id: uid(),
          weight: last?.weight ?? 0,
          reps: last?.reps ?? 0,
          done: false,
        },
      ],
    });
  };

  const updateSet = (ex: Exercise, setId: string, patch: Partial<{ weight: number; reps: number; done: boolean }>) => {
    updateExercise(ex.id, {
      sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
    });
  };

  const removeSet = (ex: Exercise, setId: string) => {
    updateExercise(ex.id, { sets: ex.sets.filter((s) => s.id !== setId) });
  };

  const totalSets = workout.exercises.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
  const totalVolume = workout.exercises.reduce(
    (n, e) => n + e.sets.filter((s) => s.done).reduce((m, s) => m + s.weight * s.reps, 0),
    0,
  );

  return (
    <div className="flex min-h-screen flex-col pb-32">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <button onClick={onCancel} className="rounded-full p-2 text-muted-foreground hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Folyamatban</p>
            <p className="text-sm font-semibold">{workout.name}</p>
          </div>
          <div className="w-9" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-secondary/60 py-2">
            <p className="text-xs text-muted-foreground">Szettek</p>
            <p className="text-lg font-bold">{totalSets}</p>
          </div>
          <div className="rounded-xl bg-secondary/60 py-2">
            <p className="text-xs text-muted-foreground">Volumen</p>
            <p className="text-lg font-bold">{totalVolume} kg</p>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-4 px-5 pt-5">
        {workout.exercises.map((ex) => (
          <section key={ex.id} className="rounded-2xl bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base font-semibold">{ex.name}</h3>
                {ex.note && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{ex.note}</p>
                )}
              </div>
              <button onClick={() => removeExercise(ex.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-2 grid grid-cols-[24px_1fr_1fr_40px_32px] gap-2 px-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>#</span>
              <span>Súly (kg)</span>
              <span>Ism.</span>
              <span></span>
              <span></span>
            </div>

            <div className="space-y-2">
              {ex.sets.map((s, i) => (
                <div
                  key={s.id}
                  className={`grid grid-cols-[24px_1fr_1fr_40px_32px] items-center gap-2 rounded-xl px-1 py-1 transition ${
                    s.done ? "bg-primary/10" : ""
                  }`}
                >
                  <span className="text-center text-sm font-semibold text-muted-foreground">{i + 1}</span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={s.weight || ""}
                    onChange={(e) => updateSet(ex, s.id, { weight: Number(e.target.value) || 0 })}
                    className="h-10 text-center"
                    placeholder="0"
                  />
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={s.reps || ""}
                    onChange={(e) => updateSet(ex, s.id, { reps: Number(e.target.value) || 0 })}
                    className="h-10 text-center"
                    placeholder="0"
                  />
                  <button
                    onClick={() => updateSet(ex, s.id, { done: !s.done })}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${
                      s.done
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                    aria-label="Kész"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => removeSet(ex, s.id)}
                    disabled={ex.sets.length === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                    aria-label="Szett törlése"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addSet(ex)}
              className="mt-3 w-full rounded-xl border border-dashed border-border py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
            >
              + Szett hozzáadása
            </button>
          </section>
        ))}

        <section className="rounded-2xl border border-dashed border-border p-4">
          <div className="flex gap-2">
            <Input
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addExercise()}
              placeholder="Pl. Fekvenyomás"
              className="h-11"
            />
            <Button onClick={addExercise} size="icon" className="h-11 w-11 shrink-0">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-5 pb-8 pt-4 backdrop-blur-xl">
        <Button
          onClick={onFinish}
          disabled={workout.exercises.length === 0}
          className="h-14 w-full rounded-2xl text-base font-semibold"
          style={{ backgroundImage: "var(--gradient-primary)", color: "var(--primary-foreground)", boxShadow: "var(--shadow-glow)" }}
        >
          Edzés befejezése
        </Button>
      </div>
    </div>
  );
}
