import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Home } from "@/components/workout/Home";
import { ActiveWorkout } from "@/components/workout/ActiveWorkout";
import { newWorkout, useWorkouts, type Workout } from "@/lib/workout-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LiftTrack — Edzésnapló" },
      { name: "description", content: "Egyszerű edzésnapló iPhone-ra. Nincs felhő, nincs Google Drive — minden a telefonodon marad." },
      { name: "theme-color", content: "#1a2030" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    ],
  }),
  component: Index,
});

function Index() {
  const { workouts, save } = useWorkouts();
  const [active, setActive] = useState<Workout | null>(null);

  if (active) {
    return (
      <ActiveWorkout
        workout={active}
        onChange={setActive}
        onCancel={() => setActive(null)}
        onFinish={() => {
          const finished = { ...active, finishedAt: new Date().toISOString() };
          save([...workouts, finished]);
          setActive(null);
        }}
      />
    );
  }

  return <Home workouts={workouts} onStart={() => setActive(newWorkout())} />;
}
