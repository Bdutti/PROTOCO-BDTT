import { api } from "encore.dev/api";
import db from "../db";

interface ExportDataParams {
  startDate?: string;
  endDate?: string;
  includeHistory?: boolean;
  includeNotes?: boolean;
  includeWeight?: boolean;
  includeSchedules?: boolean;
}

interface ExportDataResponse {
  data: string;
  filename: string;
}

export const exportData = api<ExportDataParams, ExportDataResponse>(
  { expose: true, method: "GET", path: "/api/export" },
  async ({ startDate, endDate, includeHistory = true, includeNotes = true, includeWeight = true, includeSchedules = true }) => {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    if (start > end) {
      throw new Error("startDate deve ser anterior a endDate");
    }

    const exportData: any = {
      exportedAt: new Date().toISOString(),
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    };

    if (includeHistory) {
      const sessions = await db.queryAll<{
        id: number;
        day_key: string;
        started_at: Date;
        completed_at: Date | null;
        notes: string | null;
        total_exercises: number;
        completed_exercises: number;
      }>`
        SELECT id, day_key, started_at, completed_at, notes, total_exercises, completed_exercises
        FROM workout_sessions
        WHERE started_at >= ${start} AND started_at <= ${end}
        ORDER BY started_at DESC
      `;

      const sessionIds = sessions.map(s => s.id);
      let logs: any[] = [];

      if (sessionIds.length > 0) {
        logs = await db.queryAll<{
          session_id: number;
          exercise_name: string;
          set_number: number;
          weight: number | null;
          reps: number | null;
          completed: boolean;
          notes: string | null;
          completed_at: Date | null;
        }>`
          SELECT session_id, exercise_name, set_number, weight, reps, completed, notes, completed_at
          FROM exercise_logs
          WHERE session_id = ANY(${sessionIds})
        `;
      }

      exportData.history = {
        sessions: sessions.map(s => ({
          id: s.id,
          dayKey: s.day_key,
          startedAt: s.started_at.toISOString(),
          completedAt: s.completed_at?.toISOString() || null,
          notes: s.notes,
          totalExercises: s.total_exercises,
          completedExercises: s.completed_exercises,
          exercises: logs
            .filter(l => l.session_id === s.id)
            .map(l => ({
              exerciseName: l.exercise_name,
              setNumber: l.set_number,
              weight: l.weight,
              reps: l.reps,
              completed: l.completed,
              notes: l.notes,
              completedAt: l.completed_at?.toISOString() || null
            }))
        }))
      };
    }

    if (includeNotes) {
      const notes = await db.queryAll<{
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

      exportData.notes = notes.map(n => ({
        dayKey: n.day_key,
        exerciseName: n.exercise_name,
        note: n.note,
        createdAt: n.created_at.toISOString(),
        updatedAt: n.updated_at.toISOString()
      }));
    }

    if (includeWeight) {
      const weights = await db.queryAll<{
        day_key: string;
        exercise_name: string;
        weight: number;
        reps: number;
        logged_at: Date;
      }>`
        SELECT day_key, exercise_name, weight, reps, logged_at
        FROM weight_tracking
        WHERE logged_at >= ${start} AND logged_at <= ${end}
        ORDER BY logged_at DESC
      `;

      exportData.weightTracking = weights.map(w => ({
        dayKey: w.day_key,
        exerciseName: w.exercise_name,
        weight: w.weight,
        reps: w.reps,
        loggedAt: w.logged_at.toISOString()
      }));
    }

    if (includeSchedules) {
      const schedules = await db.queryAll<{
        id: number;
        day_key: string;
        scheduled_day: string;
        scheduled_time: string;
        active: boolean;
      }>`
        SELECT id, day_key, scheduled_day, scheduled_time, active
        FROM workout_schedules
      `;

      const scheduleIds = schedules.map(s => s.id);
      let reminders: any[] = [];

      if (scheduleIds.length > 0) {
        reminders = await db.queryAll<{
          schedule_id: number;
          reminder_time: string;
          active: boolean;
        }>`
          SELECT schedule_id, reminder_time, active
          FROM workout_reminders
          WHERE schedule_id = ANY(${scheduleIds})
        `;
      }

      exportData.schedules = schedules.map(s => ({
        id: s.id,
        dayKey: s.day_key,
        scheduledDay: s.scheduled_day,
        scheduledTime: s.scheduled_time,
        active: s.active,
        reminders: reminders
          .filter(r => r.schedule_id === s.id)
          .map(r => ({
            reminderTime: r.reminder_time,
            active: r.active
          }))
      }));
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `workout-data-export-${timestamp}.json`;

    return {
      data: JSON.stringify(exportData, null, 2),
      filename
    };
  }
);
