import { api } from "encore.dev/api";
import db from "../db";

interface LogExerciseParams {
  sessionId: number;
  exerciseName: string;
  setNumber: number;
  weight?: number;
  reps?: number;
  completed?: boolean;
  notes?: string;
}

interface LogExerciseResponse {
  logId: number;
}

export const logExercise = api<LogExerciseParams, LogExerciseResponse>(
  { expose: true, method: "POST", path: "/api/history/log-exercise" },
  async ({ sessionId, exerciseName, setNumber, weight, reps, completed, notes }) => {
    if (!sessionId || sessionId <= 0) {
      throw new Error("sessionId inválido");
    }
    if (!exerciseName || exerciseName.trim() === "") {
      throw new Error("exerciseName é obrigatório");
    }
    if (setNumber === undefined || setNumber < 0) {
      throw new Error("setNumber inválido");
    }

    const existing = await db.queryRow<{ id: number }>`
      SELECT id FROM exercise_logs 
      WHERE session_id = ${sessionId} 
      AND exercise_name = ${exerciseName} 
      AND set_number = ${setNumber}
    `;

    let logId: number;

    if (existing) {
      await db.exec`
        UPDATE exercise_logs 
        SET weight = ${weight || null}, 
            reps = ${reps || null}, 
            completed = ${completed || false},
            notes = ${notes || null},
            completed_at = ${completed ? new Date() : null}
        WHERE id = ${existing.id}
      `;
      logId = existing.id;
    } else {
      const result = await db.queryRow<{ id: number }>`
        INSERT INTO exercise_logs (session_id, exercise_name, set_number, weight, reps, completed, notes, completed_at)
        VALUES (${sessionId}, ${exerciseName}, ${setNumber}, ${weight || null}, ${reps || null}, ${completed || false}, ${notes || null}, ${completed ? new Date() : null})
        RETURNING id
      `;
      if (!result) {
        throw new Error("Falha ao criar log de exercício");
      }
      logId = result.id;
    }

    if (weight && reps) {
      await db.exec`
        INSERT INTO weight_tracking (day_key, exercise_name, weight, reps)
        SELECT ws.day_key, ${exerciseName}, ${weight}, ${reps}
        FROM workout_sessions ws
        WHERE ws.id = ${sessionId}
      `;
    }

    return { logId };
  }
);
