import { api } from "encore.dev/api";
import db from "../db";

interface Reminder {
  id: number;
  reminderTime: string;
  active: boolean;
}

interface Schedule {
  id: number;
  dayKey: string;
  dayName: string;
  scheduledDay: string;
  scheduledTime: string;
  active: boolean;
  reminders: Reminder[];
}

interface GetSchedulesParams {
  activeOnly?: boolean;
}

interface GetSchedulesResponse {
  schedules: Schedule[];
}

export const getSchedules = api<GetSchedulesParams, GetSchedulesResponse>(
  { expose: true, method: "GET", path: "/api/schedule" },
  async ({ activeOnly = true }) => {
    let schedules;
    if (activeOnly) {
      schedules = await db.queryAll<{
        id: number;
        day_key: string;
        scheduled_day: string;
        scheduled_time: string;
        active: boolean;
      }>`
        SELECT id, day_key, scheduled_day, scheduled_time, active
        FROM workout_schedules
        WHERE active = true
        ORDER BY scheduled_day, scheduled_time
      `;
    } else {
      schedules = await db.queryAll<{
        id: number;
        day_key: string;
        scheduled_day: string;
        scheduled_time: string;
        active: boolean;
      }>`
        SELECT id, day_key, scheduled_day, scheduled_time, active
        FROM workout_schedules
        ORDER BY scheduled_day, scheduled_time
      `;
    }

    const scheduleIds = schedules.map(s => s.id);
    
    let reminders: Array<{
      id: number;
      schedule_id: number;
      reminder_time: string;
      active: boolean;
    }> = [];

    if (scheduleIds.length > 0) {
      reminders = await db.queryAll<{
        id: number;
        schedule_id: number;
        reminder_time: string;
        active: boolean;
      }>`
        SELECT id, schedule_id, reminder_time, active
        FROM workout_reminders
        WHERE schedule_id = ANY(${scheduleIds})
        ORDER BY reminder_time
      `;
    }

    const dayNames = await db.queryAll<{ day_key: string; name: string }>`
      SELECT day_key, name FROM workout_days
    `;
    const dayNameMap = new Map(dayNames.map(d => [d.day_key, d.name]));

    const result: Schedule[] = schedules.map(schedule => ({
      id: schedule.id,
      dayKey: schedule.day_key,
      dayName: dayNameMap.get(schedule.day_key) || schedule.day_key,
      scheduledDay: schedule.scheduled_day,
      scheduledTime: schedule.scheduled_time,
      active: schedule.active,
      reminders: reminders
        .filter(r => r.schedule_id === schedule.id)
        .map(r => ({
          id: r.id,
          reminderTime: r.reminder_time,
          active: r.active
        }))
    }));

    return { schedules: result };
  }
);
