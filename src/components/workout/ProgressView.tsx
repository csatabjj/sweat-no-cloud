import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Workout } from "@/lib/workout-store";

type Props = { workouts: Workout[] };

type WeekStat = {
  weekKey: string;
  weekStart: Date;
  weekEnd: Date;
  workouts: Workout[];
  totalVolume: number;
  totalSets: number;
};

type ExerciseWeekStat = {
  weekKey: string;
  weekStart: Date;
  topWeight: number;
  topReps: number;
  volume: number;
  sets: number;
};

// ISO week start (Monday)
function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = (x.getDay() + 6) % 7; // Mon=0
  x.setDate(x.getDate() - day);
  return x;
}

function weekKey(d: Date): string {
  const s = startOfWeek(d);
  return `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, "0")}-${String(s.getDate()).padStart(2, "0")}`;
}

function formatWeekRange(start: Date): string {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("hu-HU", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function ProgressView({ workouts }: Props) {
  const finished = workouts.filter((w) => {
    if (!w.finishedAt) return false;
    const hasResult = w.exercises.some((e) => e.sets.some((s) => s.done && s.weight > 0));
    return hasResult;
  });
  const [expanded, setExpanded] = useState<string | null>(null);

  const weeks = useMemo<WeekStat[]>(() => {
    const map = new Map<string, WeekStat>();
    for (const w of finished) {
      const date = new Date(w.finishedAt!);
      const k = weekKey(date);
      const start = startOfWeek(date);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const sets = w.exercises.reduce(
        (n, e) => n + e.sets.filter((s) => s.done).length,
        0,
      );
      const vol = w.exercises.reduce(
        (n, e) =>
          n + e.sets.filter((s) => s.done).reduce((k, s) => k + s.weight * s.reps, 0),
        0,
      );
      const cur = map.get(k);
      if (cur) {
        cur.workouts.push(w);
        cur.totalSets += sets;
        cur.totalVolume += vol;
      } else {
        map.set(k, {
          weekKey: k,
          weekStart: start,
          weekEnd: end,
          workouts: [w],
          totalSets: sets,
          totalVolume: vol,
        });
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => b.weekStart.getTime() - a.weekStart.getTime(),
    );
  }, [finished]);

  const exerciseHistory = useMemo(() => {
    // exercise name -> week stats array (ascending by week)
    const map = new Map<string, Map<string, ExerciseWeekStat>>();
    for (const w of finished) {
      const date = new Date(w.finishedAt!);
      const k = weekKey(date);
      const start = startOfWeek(date);
      for (const ex of w.exercises) {
        const done = ex.sets.filter((s) => s.done);
        if (done.length === 0) continue;
        const top = done.reduce((a, b) => (b.weight > a.weight ? b : a));
        const vol = done.reduce((n, s) => n + s.weight * s.reps, 0);
        if (!map.has(ex.name)) map.set(ex.name, new Map());
        const byWeek = map.get(ex.name)!;
        const cur = byWeek.get(k);
        if (cur) {
          if (top.weight > cur.topWeight) {
            cur.topWeight = top.weight;
            cur.topReps = top.reps;
          }
          cur.volume += vol;
          cur.sets += done.length;
        } else {
          byWeek.set(k, {
            weekKey: k,
            weekStart: start,
            topWeight: top.weight,
            topReps: top.reps,
            volume: vol,
            sets: done.length,
          });
        }
      }
    }
    const result: { name: string; weeks: ExerciseWeekStat[] }[] = [];
    for (const [name, byWeek] of map.entries()) {
      const arr = Array.from(byWeek.values()).sort(
        (a, b) => a.weekStart.getTime() - b.weekStart.getTime(),
      );
      result.push({ name, weeks: arr });
    }
    // sort by most recently trained
    result.sort((a, b) => {
      const al = a.weeks[a.weeks.length - 1].weekStart.getTime();
      const bl = b.weeks[b.weeks.length - 1].weekStart.getTime();
      return bl - al;
    });
    return result;
  }, [finished]);

  if (finished.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">Még nincs adat a fejlődéshez.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Fejezz be pár edzést, és itt heti bontásban látod a haladást.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Heti összesítés
        </h3>
        <ul className="space-y-2">
          {weeks.slice(0, 8).map((wk, i) => {
            const prev = weeks[i + 1];
            const diff = prev ? wk.totalVolume - prev.totalVolume : 0;
            const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
            const color =
              diff > 0
                ? "text-emerald-500"
                : diff < 0
                  ? "text-red-500"
                  : "text-muted-foreground";
            return (
              <li key={wk.weekKey} className="rounded-2xl bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {formatWeekRange(wk.weekStart)}
                    </p>
                    <p className="mt-0.5 font-semibold">
                      {wk.workouts.length} edzés · {wk.totalSets} szett
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {(wk.totalVolume / 1000).toFixed(1)}t
                    </p>
                    {prev && (
                      <p className={`flex items-center justify-end gap-1 text-xs ${color}`}>
                        <Icon className="h-3 w-3" />
                        {diff > 0 ? "+" : ""}
                        {(diff / 1000).toFixed(1)}t
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Gyakorlatok fejlődése
        </h3>
        <ul className="space-y-2">
          {exerciseHistory.map((ex) => {
            const last = ex.weeks[ex.weeks.length - 1];
            const first = ex.weeks[0];
            const diff = last.topWeight - first.topWeight;
            const isOpen = expanded === ex.name;
            return (
              <li key={ex.name} className="overflow-hidden rounded-2xl bg-card">
                <button
                  onClick={() => setExpanded(isOpen ? null : ex.name)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{ex.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Csúcs: {last.topWeight} kg × {last.topReps}
                      {ex.weeks.length > 1 && diff !== 0 && (
                        <span
                          className={
                            diff > 0 ? "ml-2 text-emerald-500" : "ml-2 text-red-500"
                          }
                        >
                          {diff > 0 ? "+" : ""}
                          {diff} kg az elejéhez
                        </span>
                      )}
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {isOpen && (
                  <div className="border-t border-border px-4 py-3">
                    <ul className="space-y-1.5">
                      {[...ex.weeks].reverse().map((w) => (
                        <li
                          key={w.weekKey}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-muted-foreground">
                            {formatWeekRange(w.weekStart)}
                          </span>
                          <span className="font-medium">
                            {w.topWeight} kg × {w.topReps} · {w.sets} szett ·{" "}
                            {w.volume} kg
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
