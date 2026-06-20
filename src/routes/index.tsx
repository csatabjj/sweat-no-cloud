import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Home } from "@/components/workout/Home";
import { ActiveWorkout } from "@/components/workout/ActiveWorkout";
import { TemplatePicker } from "@/components/workout/TemplatePicker";
import {
  useWorkouts,
  useTemplateOverrides,
  newWorkout,
  type Workout,
} from "@/lib/workout-store";
import { TEMPLATES } from "@/lib/workout-templates";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { workouts, save } = useWorkouts();
  const { overrides, saveOverride, resetOverride } = useTemplateOverrides();
  const [active, setActive] = useState<Workout | null>(null);
  const [showActive, setShowActive] = useState(false);
  const [picking, setPicking] = useState(false);
  const [planning, setPlanning] = useState<{ templateId: string; workout: Workout } | null>(null);

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
    </>
  );
}
