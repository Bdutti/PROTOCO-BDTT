import { api } from "encore.dev/api";
import db from "../db";

interface DeleteNoteParams {
  dayKey: string;
  exerciseName: string;
}

interface DeleteNoteResponse {
  success: boolean;
}

export const deleteNote = api<DeleteNoteParams, DeleteNoteResponse>(
  { expose: true, method: "DELETE", path: "/api/notes/delete" },
  async ({ dayKey, exerciseName }) => {
    if (!dayKey || dayKey.trim() === "") {
      throw new Error("dayKey é obrigatório");
    }
    if (!exerciseName || exerciseName.trim() === "") {
      throw new Error("exerciseName é obrigatório");
    }

    await db.exec`
      DELETE FROM exercise_notes 
      WHERE day_key = ${dayKey} AND exercise_name = ${exerciseName}
    `;

    return { success: true };
  }
);
