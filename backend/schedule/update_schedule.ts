import { api } from "encore.dev/api";
import db from "../db";

interface UpdateScheduleParams {
  scheduleId: number;
  scheduledDay?: string;
  scheduledTime?: string;
  active?: boolean;
}

interface UpdateScheduleResponse {
  success: boolean;
}

export const updateSchedule = api<UpdateScheduleParams, UpdateScheduleResponse>(
  { expose: true, method: "PUT", path: "/api/schedule/update" },
  async ({ scheduleId, scheduledDay, scheduledTime, active }) => {
    if (!scheduleId || scheduleId <= 0) {
      throw new Error("scheduleId inválido");
    }

    if (scheduledDay && !['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(scheduledDay.toLowerCase())) {
      throw new Error("scheduledDay deve ser um dia da semana válido");
    }
    if (scheduledTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(scheduledTime)) {
      throw new Error("scheduledTime deve estar no formato HH:MM");
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (scheduledDay !== undefined) {
      updates.push(`scheduled_day = $${updates.length + 1}`);
      values.push(scheduledDay.toLowerCase());
    }
    if (scheduledTime !== undefined) {
      updates.push(`scheduled_time = $${updates.length + 1}`);
      values.push(scheduledTime);
    }
    if (active !== undefined) {
      updates.push(`active = $${updates.length + 1}`);
      values.push(active);
    }

    if (updates.length === 0) {
      return { success: true };
    }

    if (scheduledDay !== undefined && scheduledTime !== undefined && active !== undefined) {
      await db.exec`
        UPDATE workout_schedules 
        SET scheduled_day = ${scheduledDay.toLowerCase()}, 
            scheduled_time = ${scheduledTime},
            active = ${active}
        WHERE id = ${scheduleId}
      `;
    } else if (scheduledDay !== undefined && scheduledTime !== undefined) {
      await db.exec`
        UPDATE workout_schedules 
        SET scheduled_day = ${scheduledDay.toLowerCase()}, 
            scheduled_time = ${scheduledTime}
        WHERE id = ${scheduleId}
      `;
    } else if (scheduledDay !== undefined && active !== undefined) {
      await db.exec`
        UPDATE workout_schedules 
        SET scheduled_day = ${scheduledDay.toLowerCase()}, 
            active = ${active}
        WHERE id = ${scheduleId}
      `;
    } else if (scheduledTime !== undefined && active !== undefined) {
      await db.exec`
        UPDATE workout_schedules 
        SET scheduled_time = ${scheduledTime}, 
            active = ${active}
        WHERE id = ${scheduleId}
      `;
    } else if (scheduledDay !== undefined) {
      await db.exec`
        UPDATE workout_schedules 
        SET scheduled_day = ${scheduledDay.toLowerCase()}
        WHERE id = ${scheduleId}
      `;
    } else if (scheduledTime !== undefined) {
      await db.exec`
        UPDATE workout_schedules 
        SET scheduled_time = ${scheduledTime}
        WHERE id = ${scheduleId}
      `;
    } else if (active !== undefined) {
      await db.exec`
        UPDATE workout_schedules 
        SET active = ${active}
        WHERE id = ${scheduleId}
      `;
    }

    return { success: true };
  }
);
