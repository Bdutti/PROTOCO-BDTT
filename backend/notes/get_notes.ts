import { api } from "encore.dev/api";
import db from "../db";

interface ExerciseNote {
  dayKey: string;
  exerciseName: string;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

interface GetNotesParams {
  dayKey?: string;
  exerciseName?: string;
}

interface GetNotesResponse {
  notes: ExerciseNote[];
}

export const getNotes = api<GetNotesParams, GetNotesResponse>(
  { expose: true, method: "GET", path: "/api/notes" },
  async ({ dayKey, exerciseName }) => {
    let notes;

    if (dayKey && exerciseName) {
      notes = await db.queryAll<{
        day_key: string;
        exercise_name: string;
        note: string;
        created_at: Date;
        updated_at: Date;
      }>`
        SELECT day_key, exercise_name, note, created_at, updated_at
        FROM exercise_notes
        WHERE day_key = ${dayKey} AND exercise_name = ${exerciseName}
      `;
    } else if (dayKey) {
      notes = await db.queryAll<{
        day_key: string;
        exercise_name: string;
        note: string;
        created_at: Date;
        updated_at: Date;
      }>`
        SELECT day_key, exercise_name, note, created_at, updated_at
        FROM exercise_notes
        WHERE day_key = ${dayKey}
      `;
    } else {
      notes = await db.queryAll<{
        day_key: string;
        exercise_name: string;
        note: string;
        created_at: Date;
        updated_at: Date;
      }>`
        SELECT day_key, exercise_name, note, created_at, updated_at
        FROM exercise_notes
        ORDER BY updated_at DESC
      `;
    }

    return {
      notes: notes.map(n => ({
        dayKey: n.day_key,
        exerciseName: n.exercise_name,
        note: n.note,
        createdAt: n.created_at,
        updatedAt: n.updated_at
      }))
    };
  }
);
