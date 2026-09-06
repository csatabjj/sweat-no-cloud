import { useEffect, useState, useCallback } from "react";

export type DailyMetrics = { hrv?: number; steps?: number; weight?: number };
export type DailyMetricsMap = Record<string, DailyMetrics>;

const KEY = "lifttrack:daily-metrics:v1";

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function read(): DailyMetricsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DailyMetricsMap) : {};
  } catch {
    return {};
  }
}

function write(map: DailyMetricsMap) {
  localStorage.setItem(KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("lifttrack:metrics-update"));
}

export function useDailyMetrics() {
  const [metrics, setMetrics] = useState<DailyMetricsMap>({});

  useEffect(() => {
    setMetrics(read());
    const handler = () => setMetrics(read());
    window.addEventListener("lifttrack:metrics-update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("lifttrack:metrics-update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const saveMetric = useCallback((date: string, patch: DailyMetrics) => {
    const next = { ...read(), [date]: { ...read()[date], ...patch } };
    write(next);
    setMetrics(next);
  }, []);

  return { metrics, saveMetric };
}
