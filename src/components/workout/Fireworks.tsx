import { useEffect, useMemo } from "react";
import "./fireworks.css";

const COLORS = [
  "#7dd3fc", "#38bdf8", "#bae6fd", // baby blue tones
  "#6ee7b7", "#34d399",             // green accents
  "#e0f2fe", "#ffffff",             // white/near-white
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// A few burst origins scattered across the upper screen
const ORIGINS = [
  { x: 20, y: 25 },
  { x: 50, y: 15 },
  { x: 78, y: 28 },
  { x: 35, y: 40 },
];

export function Fireworks({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  const particles = useMemo(() => {
    return ORIGINS.flatMap((origin, oi) =>
      Array.from({ length: 16 }, (_, i) => {
        const angle = (360 / 16) * i + rand(-10, 10);
        const dist = rand(50, 120);
        const rad = (angle * Math.PI) / 180;
        return {
          id: oi * 16 + i,
          x: origin.x,
          y: origin.y,
          dx: Math.cos(rad) * dist,
          dy: Math.sin(rad) * dist,
          size: rand(3, 6),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          duration: rand(0.9, 1.6),
          delay: oi * 0.15 + rand(0, 0.1),
        };
      })
    );
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="firework-particle"
          style={
            {
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
