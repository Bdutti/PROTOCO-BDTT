import { api } from "encore.dev/api";
import db from "../db";

interface CompleteSessionParams {
  sessionId: number;
}

interface CompleteSessionResponse {
  success: boolean;
  completedAt: Date;
}

export const completeSession = api<CompleteSessionParams, CompleteSessionResponse>(
  { expose: true, method: "POST", path: "/api/history/complete" },
  async ({ sessionId }) => {
    if (!sessionId || sessionId <= 0) {
      throw new Error("sessionId inválido");
    }

    const completedCount = await db.queryRow<{ count: number }>`
      SELECT COUNT(DISTINCT exercise_name) as count 
      FROM exercise_logs 
      WHERE session_id = ${sessionId} AND completed = true
    `;

    const now = new Date();
    await db.exec`
      UPDATE workout_sessions 
      SET completed_at = ${now}, completed_exercises = ${completedCount?.count || 0}
      WHERE id = ${sessionId}
    `;

    return {
      success: true,
      completedAt: now
    };
  }
);
