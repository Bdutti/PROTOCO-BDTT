import { api } from "encore.dev/api";
import db from "../db";

interface Exercise {
  name: string;
  series: number;
  reps: string;
  observations: string | null;
}

interface WorkoutDay {
  dayKey: string;
  name: string;
  exercises: Exercise[];
}

interface GetWorkoutsResponse {
  days: WorkoutDay[];
}

// Retrieves all workout days and their exercises.
export const getWorkouts = api<void, GetWorkoutsResponse>(
  { expose: true, method: "GET", path: "/api/workouts" },
  async () => {
    const days = await db.queryAll<{
      day_key: string;
      name: string;
      day_index: number;
    }>`SELECT day_key, name, day_index FROM workout_days ORDER BY day_index`;

    const exerciseRows = await db.queryAll<{
      day_key: string;
      name: string;
      series: number;
      reps: string;
      observations: string | null;
      exercise_index: number;
    }>`SELECT day_key, name, series, reps, observations, exercise_index FROM exercises ORDER BY day_key, exercise_index`;

    const dayMap = new Map<string, WorkoutDay>();
    for (const day of days) {
      dayMap.set(day.day_key, {
        dayKey: day.day_key,
        name: day.name,
        exercises: [],
      });
    }

    for (const ex of exerciseRows) {
      const day = dayMap.get(ex.day_key);
      if (day) {
        day.exercises.push({
          name: ex.name,
          series: ex.series,
          reps: ex.reps,
          observations: ex.observations,
        });
      }
    }

    return { days: Array.from(dayMap.values()) };
  }
);
