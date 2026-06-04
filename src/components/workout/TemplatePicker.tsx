import { useState } from "react";
import { Dumbbell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEMPLATES, suggestedTemplateId, templateToExercises } from "@/lib/workout-templates";
import { newWorkout, type Workout } from "@/lib/workout-store";

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (w: Workout) => void;
};

export function TemplatePicker({ open, onClose, onPick }: Props) {
  const [selected, setSelected] = useState<string>(suggestedTemplateId());

  if (!open) return null;

  const startBlank = () => onPick(newWorkout("Edzés"));
  const startFromTemplate = () => {
    const t = TEMPLATES.find((x) => x.id === selected)!;
    const w = newWorkout(t.name);
    w.exercises = templateToExercises(t);
    onPick(w);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-3xl bg-card pb-8 pt-2 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-border" />
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <h2 className="text-lg font-bold">Válassz napot</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2 px-5 pt-2">
          {TEMPLATES.map((t) => {
            const isSel = selected === t.id;
            const isSuggested = t.id === suggestedTemplateId();
            return (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  isSel
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t.day}
                      </span>
                      {isSuggested && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                          Ma
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-semibold">{t.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.focus}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.exercises.length} gyakorlat
                    </p>
                  </div>
                  <Dumbbell
                    className={`h-5 w-5 shrink-0 ${isSel ? "text-primary" : "text-muted-foreground"}`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 space-y-2 px-5">
          <Button
            onClick={startFromTemplate}
            className="h-12 w-full rounded-2xl font-semibold"
            style={{ backgroundImage: "var(--gradient-primary)", color: "var(--primary-foreground)" }}
          >
            Indítás sablonból
          </Button>
          <button
            onClick={startBlank}
            className="w-full rounded-2xl py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Üres edzés indítása
          </button>
        </div>
      </div>
    </div>
  );
}
