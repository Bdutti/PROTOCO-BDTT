import { api } from "encore.dev/api";
import db from "../db";

interface CreateScheduleParams {
  dayKey: string;
  scheduledDay: string;
  scheduledTime: string;
  reminders?: string[];
}

interface CreateScheduleResponse {
  scheduleId: number;
}

export const createSchedule = api<CreateScheduleParams, CreateScheduleResponse>(
  { expose: true, method: "POST", path: "/api/schedule/create" },
  async ({ dayKey, scheduledDay, scheduledTime, reminders }) => {
    if (!dayKey || dayKey.trim() === "") {
      throw new Error("dayKey é obrigatório");
    }
    if (!scheduledDay || !['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(scheduledDay.toLowerCase())) {
      throw new Error("scheduledDay deve ser um dia da semana válido");
    }
    if (!scheduledTime || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(scheduledTime)) {
      throw new Error("scheduledTime deve estar no formato HH:MM");
    }

    const schedule = await db.queryRow<{ id: number }>`
      INSERT INTO workout_schedules (day_key, scheduled_day, scheduled_time, active)
      VALUES (${dayKey}, ${scheduledDay.toLowerCase()}, ${scheduledTime}, true)
      RETURNING id
    `;

    if (!schedule) {
      throw new Error("Falha ao criar agendamento");
    }

    if (reminders && reminders.length > 0) {
      for (const reminderTime of reminders) {
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(reminderTime)) {
          throw new Error(`reminderTime inválido: ${reminderTime}`);
        }
        await db.exec`
          INSERT INTO workout_reminders (schedule_id, reminder_time, active)
          VALUES (${schedule.id}, ${reminderTime}, true)
        `;
      }
    }

    return { scheduleId: schedule.id };
  }
);
