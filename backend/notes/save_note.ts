import { api } from "encore.dev/api";
import db from "../db";

interface SaveNoteParams {
  dayKey: string;
  exerciseName: string;
  note: string;
}

interface SaveNoteResponse {
  success: boolean;
}

export const saveNote = api<SaveNoteParams, SaveNoteResponse>(
  { expose: true, method: "POST", path: "/api/notes/save" },
  async ({ dayKey, exerciseName, note }) => {
    if (!dayKey || dayKey.trim() === "") {
      throw new Error("dayKey é obrigatório");
    }
    if (!exerciseName || exerciseName.trim() === "") {
      throw new Error("exerciseName é obrigatório");
    }
    if (!note || note.trim() === "") {
      throw new Error("note é obrigatório");
    }

    const existing = await db.queryRow<{ id: number }>`
      SELECT id FROM exercise_notes 
      WHERE day_key = ${dayKey} AND exercise_name = ${exerciseName}
    `;

    const now = new Date();

    if (existing) {
      await db.exec`
        UPDATE exercise_notes 
        SET note = ${note}, updated_at = ${now}
        WHERE id = ${existing.id}
      `;
    } else {
      await db.exec`
        INSERT INTO exercise_notes (day_key, exercise_name, note, created_at, updated_at)
        VALUES (${dayKey}, ${exerciseName}, ${note}, ${now}, ${now})
      `;
    }

    return { success: true };
  }
);
