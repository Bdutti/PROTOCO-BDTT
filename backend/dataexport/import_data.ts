import { api } from "encore.dev/api";
import db from "../db";

interface ImportDataParams {
  data: string;
  overwrite?: boolean;
}

interface ImportDataResponse {
  success: boolean;
  imported: {
    sessions: number;
    notes: number;
    weights: number;
    schedules: number;
  };
}

export const importData = api<ImportDataParams, ImportDataResponse>(
  { expose: true, method: "POST", path: "/api/export/import" },
  async ({ data, overwrite = false }) => {
    if (!data || data.trim() === "") {
      throw new Error("data é obrigatório");
    }

    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      throw new Error("Dados JSON inválidos");
    }

    const counts = {
      sessions: 0,
      notes: 0,
      weights: 0,
      schedules: 0
    };

    if (parsedData.history?.sessions) {
      for (const session of parsedData.history.sessions) {
        const existingSession = await db.queryRow<{ id: number }>`
          SELECT id FROM workout_sessions 
          WHERE day_key = ${session.dayKey} 
          AND started_at = ${new Date(session.startedAt)}
        `;

        if (existingSession && !overwrite) {
          continue;
        }

        if (existingSession && overwrite) {
          await db.exec`DELETE FROM workout_sessions WHERE id = ${existingSession.id}`;
        }

        const newSession = await db.queryRow<{ id: number }>`
          INSERT INTO workout_sessions (day_key, started_at, completed_at, notes, total_exercises, completed_exercises)
          VALUES (
            ${session.dayKey}, 
            ${new Date(session.startedAt)}, 
            ${session.completedAt ? new Date(session.completedAt) : null},
            ${session.notes || null},
            ${session.totalExercises},
            ${session.completedExercises}
          )
          RETURNING id
        `;

        if (newSession && session.exercises) {
          for (const exercise of session.exercises) {
            await db.exec`
              INSERT INTO exercise_logs (session_id, exercise_name, set_number, weight, reps, completed, notes, completed_at)
              VALUES (
                ${newSession.id},
                ${exercise.exerciseName},
                ${exercise.setNumber},
                ${exercise.weight || null},
                ${exercise.reps || null},
                ${exercise.completed},
                ${exercise.notes || null},
                ${exercise.completedAt ? new Date(exercise.completedAt) : null}
              )
            `;
          }
        }

        counts.sessions++;
      }
    }

    if (parsedData.notes) {
      for (const note of parsedData.notes) {
        const existing = await db.queryRow<{ id: number }>`
          SELECT id FROM exercise_notes 
          WHERE day_key = ${note.dayKey} AND exercise_name = ${note.exerciseName}
        `;

        if (existing && !overwrite) {
          continue;
        }

        if (existing && overwrite) {
          await db.exec`
            UPDATE exercise_notes 
            SET note = ${note.note}, 
                created_at = ${new Date(note.createdAt)},
                updated_at = ${new Date(note.updatedAt)}
            WHERE id = ${existing.id}
          `;
        } else {
          await db.exec`
            INSERT INTO exercise_notes (day_key, exercise_name, note, created_at, updated_at)
            VALUES (
              ${note.dayKey},
              ${note.exerciseName},
              ${note.note},
              ${new Date(note.createdAt)},
              ${new Date(note.updatedAt)}
            )
          `;
        }

        counts.notes++;
      }
    }

    if (parsedData.weightTracking) {
      for (const weight of parsedData.weightTracking) {
        await db.exec`
          INSERT INTO weight_tracking (day_key, exercise_name, weight, reps, logged_at)
          VALUES (
            ${weight.dayKey},
            ${weight.exerciseName},
            ${weight.weight},
            ${weight.reps},
            ${new Date(weight.loggedAt)}
          )
        `;
        counts.weights++;
      }
    }

    if (parsedData.schedules) {
      for (const schedule of parsedData.schedules) {
        const newSchedule = await db.queryRow<{ id: number }>`
          INSERT INTO workout_schedules (day_key, scheduled_day, scheduled_time, active)
          VALUES (
            ${schedule.dayKey},
            ${schedule.scheduledDay},
            ${schedule.scheduledTime},
            ${schedule.active}
          )
          RETURNING id
        `;

        if (newSchedule && schedule.reminders) {
          for (const reminder of schedule.reminders) {
            await db.exec`
              INSERT INTO workout_reminders (schedule_id, reminder_time, active)
              VALUES (${newSchedule.id}, ${reminder.reminderTime}, ${reminder.active})
            `;
          }
        }

        counts.schedules++;
      }
    }

    return {
      success: true,
      imported: counts
    };
  }
);
