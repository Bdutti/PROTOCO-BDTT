import { api } from "encore.dev/api";
import db from "../db";

interface WeightEntry {
  id: number;
  dayKey: string;
  exerciseName: string;
  weight: number;
  reps: number;
  loggedAt: Date;
}

interface GetWeightHistoryParams {
  exerciseName: string;
  dayKey?: string;
  limit?: number;
}

interface GetWeightHistoryResponse {
  entries: WeightEntry[];
  maxWeight: number | null;
  avgWeight: number | null;
}

export const getWeightHistory = api<GetWeightHistoryParams, GetWeightHistoryResponse>(
  { expose: true, method: "GET", path: "/api/weight/history" },
  async ({ exerciseName, dayKey, limit = 30 }) => {
    if (!exerciseName || exerciseName.trim() === "") {
      throw new Error("exerciseName é obrigatório");
    }
    if (limit < 1 || limit > 100) {
      throw new Error("limit deve estar entre 1 e 100");
    }

    let entries;
    if (dayKey) {
      entries = await db.queryAll<{
        id: number;
        day_key: string;
        exercise_name: string;
        weight: number;
        reps: number;
        logged_at: Date;
      }>`
        SELECT id, day_key, exercise_name, weight, reps, logged_at
        FROM weight_tracking
        WHERE exercise_name = ${exerciseName} AND day_key = ${dayKey}
        ORDER BY logged_at DESC
        LIMIT ${limit}
      `;
    } else {
      entries = await db.queryAll<{
        id: number;
        day_key: string;
        exercise_name: string;
        weight: number;
        reps: number;
        logged_at: Date;
      }>`
        SELECT id, day_key, exercise_name, weight, reps, logged_at
        FROM weight_tracking
        WHERE exercise_name = ${exerciseName}
        ORDER BY logged_at DESC
        LIMIT ${limit}
      `;
    }

    let stats;
    if (dayKey) {
      stats = await db.queryRow<{ max_weight: number; avg_weight: number }>`
        SELECT MAX(weight) as max_weight, AVG(weight) as avg_weight
        FROM weight_tracking
        WHERE exercise_name = ${exerciseName} AND day_key = ${dayKey}
      `;
    } else {
      stats = await db.queryRow<{ max_weight: number; avg_weight: number }>`
        SELECT MAX(weight) as max_weight, AVG(weight) as avg_weight
        FROM weight_tracking
        WHERE exercise_name = ${exerciseName}
      `;
    }

    return {
      entries: entries.map(e => ({
        id: e.id,
        dayKey: e.day_key,
        exerciseName: e.exercise_name,
        weight: e.weight,
        reps: e.reps,
        loggedAt: e.logged_at
      })),
      maxWeight: stats?.max_weight || null,
      avgWeight: stats?.avg_weight || null
    };
  }
);
