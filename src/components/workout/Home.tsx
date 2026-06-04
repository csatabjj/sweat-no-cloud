import { useState } from "react";
import { Dumbbell, Flame, TrendingUp, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressView } from "./ProgressView";
import type { Workout } from "@/lib/workout-store";

type Props = {
  workouts: Workout[];
  onStart: () => void;
};

const dayNames = ["V", "H", "K", "Sz", "Cs", "P", "Sz"];

export function Home({ workouts, onStart }: Props) {
  const [tab, setTab] = useState<"history" | "progress">("history");
  const finished = workouts.filter((w) => w.finishedAt);
  const totalVolume = finished.reduce(
    (n, w) =>
      n +
      w.exercises.reduce(
        (m, e) => m + e.sets.filter((s) => s.done).reduce((k, s) => k + s.weight * s.reps, 0),
        0,
      ),
    0,
  );

  // streak: consecutive days back from today with a finished workout
  const dateSet = new Set(finished.map((w) => new Date(w.finishedAt!).toDateString()));
  let streak = 0;
  for (let i = 0; ; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (dateSet.has(d.toDateString())) streak++;
    else break;
  }

  // last 7 days dots
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { d, active: dateSet.has(d.toDateString()) };
  });

  const recent = [...finished].reverse().slice(0, 8);

  return (
    <div className="min-h-screen pb-32">
      <header className="px-5 pb-6 pt-12">
        <p className="text-sm text-muted-foreground">Üdv újra</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Mai edzés</h1>
      </header>

      <section className="px-5">
        <div
          className="relative overflow-hidden rounded-3xl p-5 text-primary-foreground"
          style={{ backgroundImage: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Streak</p>
              <p className="mt-1 text-5xl font-black">{streak}</p>
              <p className="mt-1 text-sm opacity-80">{streak === 1 ? "nap" : "nap egymás után"}</p>
            </div>
            <Flame className="h-10 w-10 opacity-90" />
          </div>
          <div className="mt-5 flex items-center justify-between">
            {days.map(({ d, active }, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase opacity-70">
                  {dayNames[d.getDay()]}
                </span>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${active ? "bg-primary-foreground" : "bg-primary-foreground/25"}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 px-5 pt-4">
        <div className="rounded-2xl bg-card p-4">
          <Dumbbell className="h-5 w-5 text-primary" />
          <p className="mt-3 text-2xl font-bold">{finished.length}</p>
          <p className="text-xs text-muted-foreground">összes edzés</p>
        </div>
        <div className="rounded-2xl bg-card p-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <p className="mt-3 text-2xl font-bold">{(totalVolume / 1000).toFixed(1)}t</p>
          <p className="text-xs text-muted-foreground">összes volumen</p>
        </div>
      </section>

      <section className="px-5 pt-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex gap-1 rounded-xl bg-secondary/60 p-1">
            <button
              onClick={() => setTab("history")}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                tab === "history" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              Előzmények
            </button>
            <button
              onClick={() => setTab("progress")}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                tab === "progress" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              Fejlődés
            </button>
          </div>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </div>
        {tab === "history" ? (
          recent.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">Még nincs befejezett edzés.</p>
              <p className="mt-1 text-xs text-muted-foreground">Indítsd el az elsőt lent.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {recent.map((w) => {
                const sets = w.exercises.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
                const vol = w.exercises.reduce(
                  (n, e) => n + e.sets.filter((s) => s.done).reduce((k, s) => k + s.weight * s.reps, 0),
                  0,
                );
                return (
                  <li key={w.id} className="rounded-2xl bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{w.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(w.finishedAt!).toLocaleDateString("hu-HU", {
                            month: "short",
                            day: "numeric",
                            weekday: "short",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{vol} kg</p>
                        <p className="text-xs text-muted-foreground">{sets} szett · {w.exercises.length} gyakorlat</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )
        ) : (
          <ProgressView workouts={workouts} />
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 px-5 pb-8 pt-4">
        <Button
          onClick={onStart}
          className="h-16 w-full rounded-2xl text-base font-bold"
          style={{ backgroundImage: "var(--gradient-primary)", color: "var(--primary-foreground)", boxShadow: "var(--shadow-glow)" }}
        >
          <Plus className="mr-2 h-5 w-5" />
          Új edzés indítása
        </Button>
      </div>
    </div>
  );
}
