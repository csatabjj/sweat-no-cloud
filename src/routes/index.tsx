import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Home } from "@/components/workout/Home";
import { ActiveWorkout } from "@/components/workout/ActiveWorkout";
import { TemplatePicker } from "@/components/workout/TemplatePicker";
import { Fireworks } from "@/components/workout/Fireworks";
import {
  useWorkouts,
  useTemplateOverrides,
  newWorkout,
  type Workout,
} from "@/lib/workout-store";
import { TEMPLATES } from "@/lib/workout-templates";
import { useDailyMetrics, dateKey, type DailyMetrics } from "@/lib/daily-metrics";

export const Route = createFileRoute("/")({
  component: Index,
});

// Bridge for the Apple Shortcuts flow: a Shortcut reads today's HRV/steps/weight
// from Health and opens ?hrv=..&steps=..&weight=.. to save them without typing.
function useHealthMetricsBridge(saveMetric: (date: string, patch: DailyMetrics) => void) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hrv = params.get("hrv");
    const steps = params.get("steps");
    const weight = params.get("weight");
    if (!hrv && !steps && !weight) return;
    const patch: DailyMetrics = {};
    if (hrv) patch.hrv = parseFloat(hrv.replace(",", "."));
    if (steps) patch.steps = parseFloat(steps.replace(",", "."));
    if (weight) patch.weight = parseFloat(weight.replace(",", "."));
    saveMetric(dateKey(), patch);
    window.history.replaceState({}, "", window.location.pathname);
    toast.success("Napi mérés mentve (Health)");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function Index() {
  const { workouts, save } = useWorkouts();
  const { overrides, saveOverride, resetOverride } = useTemplateOverrides();
  const { saveMetric } = useDailyMetrics();
  const [active, setActive] = useState<Workout | null>(null);
  const [showActive, setShowActive] = useState(false);
  const [picking, setPicking] = useState(false);
  const [planning, setPlanning] = useState<{ templateId: string; workout: Workout } | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);
  useHealthMetricsBridge(saveMetric);

  if (planning) {
    return (
      <ActiveWorkout
        workout={planning.workout}
        planMode
        onChange={(w) => setPlanning({ ...planning, workout: w })}
        onCancel={() => setPlanning(null)}
        onReset={() => {
          resetOverride(planning.templateId);
          setPlanning(null);
        }}
        onFinish={() => {
          saveOverride(planning.templateId, planning.workout.exercises);
          setPlanning(null);
          setPicking(true);
          toast.success("Sablon mentve");
        }}
      />
    );
  }

  if (active && showActive) {
    const isExisting = workouts.some((w) => w.id === active.id);
    const isEditingFinished = isExisting && !!active.finishedAt;
    const activeTemplate = TEMPLATES.find((t) => t.name === active.name);
    return (
      <ActiveWorkout
        workout={active}
        editingFinished={isEditingFinished}
        onChange={setActive}
        onCancel={() => setShowActive(false)}
        onDiscard={() => {
          setActive(null);
          setShowActive(false);
        }}
        onFinish={() => {
          const finished = {
            ...active,
            finishedAt: active.finishedAt ?? new Date().toISOString(),
          };
          if (isExisting) {
            save(workouts.map((w) => (w.id === finished.id ? finished : w)));
          } else {
            save([...workouts, finished]);
            setShowFireworks(true);
          }
          setActive(null);
          setShowActive(false);
        }}
        onSaveTemplate={
          activeTemplate
            ? () => {
                saveOverride(activeTemplate.id, active.exercises);
                toast.success("Sablon mentve");
              }
            : undefined
        }
      />
    );
  }

  return (
    <>
      <Home
        workouts={workouts}
        activeWorkout={active}
        onResume={() => setShowActive(true)}
        onDiscardActive={() => setActive(null)}
        onStart={() => setPicking(true)}
        onEditFinished={(w) => {
          setActive(w);
          setShowActive(true);
        }}
      />
      <TemplatePicker
        open={picking}
        onClose={() => setPicking(false)}
        workouts={workouts}
        overrides={overrides}
        onPick={(w) => {
          setPicking(false);
          setActive(w);
          setShowActive(true);
        }}
        onEdit={(templateId, exercises) => {
          const t = TEMPLATES.find((x) => x.id === templateId);
          const w = newWorkout(t?.name ?? "Sablon");
          w.exercises = exercises;
          setPicking(false);
          setPlanning({ templateId, workout: w });
        }}
      />
      {showFireworks && <Fireworks onDone={() => setShowFireworks(false)} />}
    </>
  );
}
