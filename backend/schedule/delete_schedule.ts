import { api } from "encore.dev/api";
import db from "../db";

interface DeleteScheduleParams {
  scheduleId: number;
}

interface DeleteScheduleResponse {
  success: boolean;
}

export const deleteSchedule = api<DeleteScheduleParams, DeleteScheduleResponse>(
  { expose: true, method: "DELETE", path: "/api/schedule/delete" },
  async ({ scheduleId }) => {
    if (!scheduleId || scheduleId <= 0) {
      throw new Error("scheduleId inválido");
    }

    await db.exec`
      DELETE FROM workout_schedules WHERE id = ${scheduleId}
    `;

    return { success: true };
  }
);
