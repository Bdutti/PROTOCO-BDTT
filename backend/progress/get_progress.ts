import { api, Query } from "encore.dev/api";
import db from "../db";

interface SetProgress {
  exerciseName: string;
  setIndex: number;
  completed: boolean;
}

interface GetProgressParams {
  dayKey: Query<string>;
}

interface GetProgressResponse {
  progress: SetProgress[];
}

// Retrieves workout progress for a specific day.
export const getProgress = api<GetProgressParams, GetProgressResponse>(
  { expose: true, method: "GET", path: "/api/progress" },
  async ({ dayKey }) => {
    if (!dayKey || dayKey.trim() === "") {
      throw new Error("dayKey é obrigatório");
    }
    const rows = await db.queryAll<{
      exercise_name: string;
      set_index: number;
      completed: boolean;
    }>`SELECT exercise_name, set_index, completed FROM progress WHERE day_key = ${dayKey}`;

    return {
      progress: rows.map((r) => ({
        exerciseName: r.exercise_name,
        setIndex: r.set_index,
        completed: r.completed,
      })),
    };
  }
);
