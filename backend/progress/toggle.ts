import { api } from "encore.dev/api";
import db from "../db";

interface ToggleSetParams {
  dayKey: string;
  exerciseName: string;
  setIndex: number;
}

interface ToggleSetResponse {
  completed: boolean;
}

// Toggles the completion status of a specific set.
export const toggle = api<ToggleSetParams, ToggleSetResponse>(
  { expose: true, method: "POST", path: "/api/progress/toggle" },
  async ({ dayKey, exerciseName, setIndex }) => {
    const existing = await db.queryRow<{
      completed: boolean;
    }>`SELECT completed FROM progress WHERE day_key = ${dayKey} AND exercise_name = ${exerciseName} AND set_index = ${setIndex}`;

    if (existing) {
      const newCompleted = !existing.completed;
      await db.exec`
        UPDATE progress 
        SET completed = ${newCompleted}, completed_at = ${newCompleted ? new Date() : null}
        WHERE day_key = ${dayKey} AND exercise_name = ${exerciseName} AND set_index = ${setIndex}
      `;
      return { completed: newCompleted };
    } else {
      await db.exec`
        INSERT INTO progress (day_key, exercise_name, set_index, completed, completed_at)
        VALUES (${dayKey}, ${exerciseName}, ${setIndex}, true, ${new Date()})
      `;
      return { completed: true };
    }
  }
);
