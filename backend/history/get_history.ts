import { api } from "encore.dev/api";
import db from "../db";

interface ExerciseLog {
  exerciseName: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
  notes: string | null;
  completedAt: Date | null;
}

interface WorkoutSession {
  sessionId: number;
  dayKey: string;
  dayName: string;
  startedAt: Date;
  completedAt: Date | null;
  notes: string | null;
  totalExercises: number;
  completedExercises: number;
  exercises: ExerciseLog[];
}

interface GetHistoryParams {
  dayKey?: string;
  limit?: number;
}

interface GetHistoryResponse {
  sessions: WorkoutSession[];
}

export const getHistory = api<GetHistoryParams, GetHistoryResponse>(
  { expose: true, method: "GET", path: "/api/history" },
  async ({ dayKey, limit = 20 }) => {
    if (limit < 1 || limit > 100) {
      throw new Error("limit deve estar entre 1 e 100");
    }

    let sessions;
    if (dayKey) {
      sessions = await db.queryAll<{
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
        WHERE day_key = ${dayKey}
        ORDER BY started_at DESC
        LIMIT ${limit}
      `;
    } else {
      sessions = await db.queryAll<{
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
        ORDER BY started_at DESC
        LIMIT ${limit}
      `;
    }

    const sessionIds = sessions.map(s => s.id);
    
    let logs: Array<{
      session_id: number;
      exercise_name: string;
      set_number: number;
      weight: number | null;
      reps: number | null;
      completed: boolean;
      notes: string | null;
      completed_at: Date | null;
    }> = [];

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
        ORDER BY set_number
      `;
    }

    const dayNames = await db.queryAll<{ day_key: string; name: string }>`
      SELECT day_key, name FROM workout_days
    `;
    const dayNameMap = new Map(dayNames.map(d => [d.day_key, d.name]));

    const result: WorkoutSession[] = sessions.map(session => ({
      sessionId: session.id,
      dayKey: session.day_key,
      dayName: dayNameMap.get(session.day_key) || session.day_key,
      startedAt: session.started_at,
      completedAt: session.completed_at,
      notes: session.notes,
      totalExercises: session.total_exercises,
      completedExercises: session.completed_exercises,
      exercises: logs
        .filter(log => log.session_id === session.id)
        .map(log => ({
          exerciseName: log.exercise_name,
          setNumber: log.set_number,
          weight: log.weight,
          reps: log.reps,
          completed: log.completed,
          notes: log.notes,
          completedAt: log.completed_at
        }))
    }));

    return { sessions: result };
  }
);
