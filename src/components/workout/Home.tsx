import { useState, useCallback } from "react";
import { Dumbbell, Flame, TrendingUp, Plus, Download, Play, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressView } from "./ProgressView";
import { DailyMetricsCard } from "./DailyMetricsCard";
import type { Workout } from "@/lib/workout-store";
import { useDailyMetrics, dateKey } from "@/lib/daily-metrics";

type Props = {
  workouts: Workout[];
  onStart: () => void;
  activeWorkout?: Workout | null;
  onResume?: () => void;
  onDiscardActive?: () => void;
  onEditFinished?: (w: Workout) => void;
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Home({ workouts, onStart, activeWorkout, onResume, onDiscardActive, onEditFinished }: Props) {
  const [tab, setTab] = useState<"history" | "progress">("history");
  const { metrics, saveMetric } = useDailyMetrics();
  const today = dateKey();
  const finished = workouts.filter((w) => {
    if (!w.finishedAt) return false;
    const hasResult = w.exercises.some((e) => e.sets.some((s) => s.done && s.weight > 0));
    return hasResult;
  });
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

  const exportToCsv = useCallback(() => {
    if (finished.length === 0) return;
    const rows: string[][] = [];
    rows.push(["Workout", "Date", "Exercise", "Set", "Weight (kg)", "Reps", "Note"]);
    for (const w of finished) {
      const date = new Date(w.finishedAt!).toLocaleDateString("en-GB");
      for (const ex of w.exercises) {
        const doneSets = ex.sets.filter((s) => s.done);
        if (doneSets.length === 0) continue;
        doneSets.forEach((s, idx) => {
          rows.push([
            w.name,
            date,
            ex.name,
            String(idx + 1),
            String(s.weight),
            String(s.reps),
            ex.note || "",
          ]);
        });
      }
    }
    const csv = rows.map((r) => r.map((c) => '"' + c.replace(/"/g, '""') + '"').join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workouts_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [finished]);

  const exportMetricsToCsv = useCallback(() => {
    const dates = Object.keys(metrics).sort();
    if (dates.length === 0) return;
    const rows: string[][] = [["Date", "HRV", "Body weight (kg)", "Steps"]];
    for (const date of dates) {
      const m = metrics[date];
      rows.push([date, m.hrv ? String(m.hrv) : "", m.weight ? String(m.weight) : "", m.steps ? String(m.steps) : ""]);
    }
    const csv = rows.map((r) => r.map((c) => '"' + c.replace(/"/g, '""') + '"').join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily_metrics_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [metrics]);

  return (
    <div className="min-h-screen pb-32">
      <header className="px-5 pb-6 pt-12">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Today's workout</h1>
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
              <p className="mt-1 text-sm opacity-80">{streak === 1 ? "day" : "days in a row"}</p>
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
          <p className="text-xs text-muted-foreground">total workouts</p>
        </div>
        <div className="rounded-2xl bg-card p-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <p className="mt-3 text-2xl font-bold">{(totalVolume / 1000).toFixed(1)}t</p>
          <p className="text-xs text-muted-foreground">total volume</p>
        </div>
      </section>

      <section className="px-5 pt-4">
        <DailyMetricsCard value={metrics[today] ?? {}} onChange={(patch) => saveMetric(today, patch)} />
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
              History
            </button>
            <button
              onClick={() => setTab("progress")}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                tab === "progress" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              Progress
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCsv}
              disabled={finished.length === 0}
              className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-1.5 text-sm font-semibold text-muted-foreground transition active:scale-95 disabled:opacity-40"
            >
              <Download className="h-4 w-4" />
              CSV
            </button>
            <button
              onClick={exportMetricsToCsv}
              disabled={Object.keys(metrics).length === 0}
              className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-1.5 text-sm font-semibold text-muted-foreground transition active:scale-95 disabled:opacity-40"
            >
              <Download className="h-4 w-4" />
              Metrics
            </button>
          </div>
        </div>
        {tab === "history" ? (
          recent.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">No finished workouts yet.</p>
              <p className="mt-1 text-xs text-muted-foreground">Start your first one below.</p>
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
                  <li key={w.id}>
                    <button
                      onClick={() => onEditFinished?.(w)}
                      className="flex w-full items-center justify-between rounded-2xl bg-card p-4 text-left transition active:scale-[0.99]"
                    >
                      <div>
                        <p className="font-semibold">{w.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(w.finishedAt!).toLocaleDateString("en-GB", {
                            month: "short",
                            day: "numeric",
                            weekday: "short",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold">{vol} kg</p>
                          <p className="text-xs text-muted-foreground">{sets} sets · {w.exercises.length} exercises</p>
                        </div>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
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
        {activeWorkout ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                onClick={onResume}
                className="h-16 flex-1 rounded-2xl text-base font-bold"
                style={{ backgroundImage: "var(--gradient-primary)", color: "var(--primary-foreground)", boxShadow: "var(--shadow-glow)" }}
              >
                <Play className="mr-2 h-5 w-5" />
                Back to workout
              </Button>
              <Button
                onClick={onDiscardActive}
                variant="secondary"
                className="h-16 w-16 rounded-2xl"
                aria-label="Discard workout in progress"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <button
              onClick={onStart}
              className="w-full text-center text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              + Start a new workout instead
            </button>
          </div>
        ) : (
          <Button
            onClick={onStart}
            className="h-16 w-full rounded-2xl text-base font-bold"
            style={{ backgroundImage: "var(--gradient-primary)", color: "var(--primary-foreground)", boxShadow: "var(--shadow-glow)" }}
          >
            <Plus className="mr-2 h-5 w-5" />
            Start new workout
          </Button>
        )}
      </div>
    </div>
  );
}
