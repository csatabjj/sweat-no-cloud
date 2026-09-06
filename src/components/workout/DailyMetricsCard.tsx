import { Heart, Footprints, Scale } from "lucide-react";
import { DecimalInput } from "./DecimalInput";
import type { DailyMetrics } from "@/lib/daily-metrics";

type Props = {
  value: DailyMetrics;
  onChange: (patch: DailyMetrics) => void;
};

export function DailyMetricsCard({ value, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-dashed border-border p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Napi mérések
      </p>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            <Heart className="h-3 w-3" /> HRV reggel
          </label>
          <DecimalInput
            value={value.hrv ?? 0}
            onChange={(v) => onChange({ hrv: v })}
            className="h-10 text-center"
          />
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            <Scale className="h-3 w-3" /> Testsúly reggel
          </label>
          <DecimalInput
            value={value.weight ?? 0}
            onChange={(v) => onChange({ weight: v })}
            className="h-10 text-center"
          />
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            <Footprints className="h-3 w-3" /> Lépés estig
          </label>
          <DecimalInput
            value={value.steps ?? 0}
            onChange={(v) => onChange({ steps: v })}
            className="h-10 text-center"
          />
        </div>
      </div>
    </section>
  );
}
