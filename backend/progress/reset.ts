import { api } from "encore.dev/api";
import db from "../db";

interface ResetDayParams {
  dayKey: string;
}

// Resets all progress for a specific workout day.
export const reset = api<ResetDayParams, void>(
  { expose: true, method: "POST", path: "/api/progress/reset" },
  async ({ dayKey }) => {
    if (!dayKey || dayKey.trim() === "") {
      throw new Error("dayKey é obrigatório");
    }
    await db.exec`DELETE FROM progress WHERE day_key = ${dayKey}`;
  }
);
