import { Heart, Footprints, Scale } from "lucide-react";
import { DecimalInput } from "./DecimalInput";
import type { DailyMetrics } from "@/lib/daily-metrics";

type Props = {
  value: DailyMetrics;
  onChange: (patch: DailyMetrics) => void;
};

export function DailyMetricsCard({ value, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-sky-300 bg-sky-100 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sky-700">
        Napi mérések
      </p>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="mb-1 flex min-h-[2rem] items-start gap-1 text-[10px] uppercase leading-tight tracking-wide text-sky-700/80">
            <Heart className="mt-0.5 h-3 w-3 shrink-0" /> HRV reggel
          </label>
          <DecimalInput
            value={value.hrv ?? 0}
            onChange={(v) => onChange({ hrv: v })}
            className="h-10 border-sky-200 bg-white text-center"
          />
        </div>
        <div>
          <label className="mb-1 flex min-h-[2rem] items-start gap-1 text-[10px] uppercase leading-tight tracking-wide text-sky-700/80">
            <Scale className="mt-0.5 h-3 w-3 shrink-0" /> Testsúly reggel
          </label>
          <DecimalInput
            value={value.weight ?? 0}
            onChange={(v) => onChange({ weight: v })}
            className="h-10 border-sky-200 bg-white text-center"
          />
        </div>
        <div>
          <label className="mb-1 flex min-h-[2rem] items-start gap-1 text-[10px] uppercase leading-tight tracking-wide text-sky-700/80">
            <Footprints className="mt-0.5 h-3 w-3 shrink-0" /> Lépés estig
          </label>
          <DecimalInput
            value={value.steps ?? 0}
            onChange={(v) => onChange({ steps: v })}
            className="h-10 border-sky-200 bg-white text-center"
          />
        </div>
      </div>
    </section>
  );
}
