import { api } from "encore.dev/api";
import db from "../db";

interface StartSessionParams {
  dayKey: string;
  notes?: string;
}

interface StartSessionResponse {
  sessionId: number;
  startedAt: Date;
}

export const startSession = api<StartSessionParams, StartSessionResponse>(
  { expose: true, method: "POST", path: "/api/history/start" },
  async ({ dayKey, notes }) => {
    if (!dayKey || dayKey.trim() === "") {
      throw new Error("dayKey é obrigatório");
    }

    const exercises = await db.queryAll<{ name: string }>`
      SELECT name FROM exercises WHERE day_key = ${dayKey}
    `;

    const session = await db.queryRow<{ id: number; started_at: Date }>`
      INSERT INTO workout_sessions (day_key, notes, total_exercises)
      VALUES (${dayKey}, ${notes || null}, ${exercises.length})
      RETURNING id, started_at
    `;

    if (!session) {
      throw new Error("Falha ao criar sessão de treino");
    }

    return {
      sessionId: session.id,
      startedAt: session.started_at
    };
  }
);
