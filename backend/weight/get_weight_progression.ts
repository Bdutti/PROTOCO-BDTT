import { api } from "encore.dev/api";
import db from "../db";

interface WeightProgressionPoint {
  date: string;
  weight: number;
  reps: number;
}

interface GetWeightProgressionParams {
  exerciseName: string;
  dayKey?: string;
  days?: number;
}

interface GetWeightProgressionResponse {
  progression: WeightProgressionPoint[];
}

export const getWeightProgression = api<GetWeightProgressionParams, GetWeightProgressionResponse>(
  { expose: true, method: "GET", path: "/api/weight/progression" },
  async ({ exerciseName, dayKey, days = 30 }) => {
    if (!exerciseName || exerciseName.trim() === "") {
      throw new Error("exerciseName é obrigatório");
    }
    if (days < 1 || days > 365) {
      throw new Error("days deve estar entre 1 e 365");
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let progression;
    if (dayKey) {
      progression = await db.queryAll<{
        logged_at: Date;
        weight: number;
        reps: number;
      }>`
        SELECT DATE(logged_at) as logged_at, MAX(weight) as weight, MAX(reps) as reps
        FROM weight_tracking
        WHERE exercise_name = ${exerciseName} 
        AND day_key = ${dayKey}
        AND logged_at >= ${startDate}
        GROUP BY DATE(logged_at)
        ORDER BY logged_at ASC
      `;
    } else {
      progression = await db.queryAll<{
        logged_at: Date;
        weight: number;
        reps: number;
      }>`
        SELECT DATE(logged_at) as logged_at, MAX(weight) as weight, MAX(reps) as reps
        FROM weight_tracking
        WHERE exercise_name = ${exerciseName}
        AND logged_at >= ${startDate}
        GROUP BY DATE(logged_at)
        ORDER BY logged_at ASC
      `;
    }

    return {
      progression: progression.map(p => ({
        date: p.logged_at.toISOString().split('T')[0],
        weight: p.weight,
        reps: p.reps
      }))
    };
  }
);
