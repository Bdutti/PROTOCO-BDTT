import { api } from "encore.dev/api";
import db from "../db";

interface ExerciseStats {
  exerciseName: string;
  totalSets: number;
  completedSets: number;
  avgWeight: number | null;
  maxWeight: number | null;
  totalWorkouts: number;
}

interface WorkoutStats {
  totalWorkouts: number;
  completedWorkouts: number;
  totalSetsCompleted: number;
  mostFrequentDay: string | null;
  currentStreak: number;
  exerciseStats: ExerciseStats[];
}

interface GetStatisticsParams {
  dayKey?: string;
  exerciseName?: string;
  startDate?: string;
  endDate?: string;
}

interface GetStatisticsResponse {
  stats: WorkoutStats;
}

export const getStatistics = api<GetStatisticsParams, GetStatisticsResponse>(
  { expose: true, method: "GET", path: "/api/history/statistics" },
  async ({ dayKey, exerciseName, startDate, endDate }) => {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    if (start > end) {
      throw new Error("startDate deve ser anterior a endDate");
    }

    let sessionStats;
    if (dayKey) {
      sessionStats = await db.queryRow<{
        total_workouts: number;
        completed_workouts: number;
      }>`
        SELECT COUNT(*) as total_workouts,
               COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed_workouts
        FROM workout_sessions
        WHERE started_at >= ${start} AND started_at <= ${end}
        AND day_key = ${dayKey}
      `;
    } else {
      sessionStats = await db.queryRow<{
        total_workouts: number;
        completed_workouts: number;
      }>`
        SELECT COUNT(*) as total_workouts,
               COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed_workouts
        FROM workout_sessions
        WHERE started_at >= ${start} AND started_at <= ${end}
      `;
    }

    let setsCompleted;
    if (dayKey && exerciseName) {
      setsCompleted = await db.queryRow<{ total: number }>`
        SELECT COUNT(*) as total
        FROM exercise_logs el
        JOIN workout_sessions ws ON el.session_id = ws.id
        WHERE ws.started_at >= ${start} 
        AND ws.started_at <= ${end}
        AND el.completed = true
        AND ws.day_key = ${dayKey}
        AND el.exercise_name = ${exerciseName}
      `;
    } else if (dayKey) {
      setsCompleted = await db.queryRow<{ total: number }>`
        SELECT COUNT(*) as total
        FROM exercise_logs el
        JOIN workout_sessions ws ON el.session_id = ws.id
        WHERE ws.started_at >= ${start} 
        AND ws.started_at <= ${end}
        AND el.completed = true
        AND ws.day_key = ${dayKey}
      `;
    } else if (exerciseName) {
      setsCompleted = await db.queryRow<{ total: number }>`
        SELECT COUNT(*) as total
        FROM exercise_logs el
        JOIN workout_sessions ws ON el.session_id = ws.id
        WHERE ws.started_at >= ${start} 
        AND ws.started_at <= ${end}
        AND el.completed = true
        AND el.exercise_name = ${exerciseName}
      `;
    } else {
      setsCompleted = await db.queryRow<{ total: number }>`
        SELECT COUNT(*) as total
        FROM exercise_logs el
        JOIN workout_sessions ws ON el.session_id = ws.id
        WHERE ws.started_at >= ${start} 
        AND ws.started_at <= ${end}
        AND el.completed = true
      `;
    }

    const mostFrequent = await db.queryRow<{ day_key: string }>`
      SELECT day_key
      FROM workout_sessions
      WHERE started_at >= ${start} AND started_at <= ${end}
      GROUP BY day_key
      ORDER BY COUNT(*) DESC
      LIMIT 1
    `;

    const recentSessions = await db.queryAll<{ started_at: Date }>`
      SELECT DATE(started_at) as started_at
      FROM workout_sessions
      WHERE completed_at IS NOT NULL
      ORDER BY started_at DESC
      LIMIT 30
    `;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < recentSessions.length; i++) {
      const sessionDate = new Date(recentSessions[i].started_at);
      sessionDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak || (i === 0 && daysDiff <= 1)) {
        streak++;
      } else {
        break;
      }
    }

    let exerciseStats;
    if (dayKey && exerciseName) {
      exerciseStats = await db.queryAll<{
        exercise_name: string;
        total_sets: number;
        completed_sets: number;
        avg_weight: number | null;
        max_weight: number | null;
        total_workouts: number;
      }>`
        SELECT 
          el.exercise_name,
          COUNT(*) as total_sets,
          COUNT(CASE WHEN el.completed = true THEN 1 END) as completed_sets,
          AVG(el.weight) as avg_weight,
          MAX(el.weight) as max_weight,
          COUNT(DISTINCT el.session_id) as total_workouts
        FROM exercise_logs el
        JOIN workout_sessions ws ON el.session_id = ws.id
        WHERE ws.started_at >= ${start} AND ws.started_at <= ${end}
        AND ws.day_key = ${dayKey}
        AND el.exercise_name = ${exerciseName}
        GROUP BY el.exercise_name
        ORDER BY total_sets DESC
      `;
    } else if (dayKey) {
      exerciseStats = await db.queryAll<{
        exercise_name: string;
        total_sets: number;
        completed_sets: number;
        avg_weight: number | null;
        max_weight: number | null;
        total_workouts: number;
      }>`
        SELECT 
          el.exercise_name,
          COUNT(*) as total_sets,
          COUNT(CASE WHEN el.completed = true THEN 1 END) as completed_sets,
          AVG(el.weight) as avg_weight,
          MAX(el.weight) as max_weight,
          COUNT(DISTINCT el.session_id) as total_workouts
        FROM exercise_logs el
        JOIN workout_sessions ws ON el.session_id = ws.id
        WHERE ws.started_at >= ${start} AND ws.started_at <= ${end}
        AND ws.day_key = ${dayKey}
        GROUP BY el.exercise_name
        ORDER BY total_sets DESC
      `;
    } else if (exerciseName) {
      exerciseStats = await db.queryAll<{
        exercise_name: string;
        total_sets: number;
        completed_sets: number;
        avg_weight: number | null;
        max_weight: number | null;
        total_workouts: number;
      }>`
        SELECT 
          el.exercise_name,
          COUNT(*) as total_sets,
          COUNT(CASE WHEN el.completed = true THEN 1 END) as completed_sets,
          AVG(el.weight) as avg_weight,
          MAX(el.weight) as max_weight,
          COUNT(DISTINCT el.session_id) as total_workouts
        FROM exercise_logs el
        JOIN workout_sessions ws ON el.session_id = ws.id
        WHERE ws.started_at >= ${start} AND ws.started_at <= ${end}
        AND el.exercise_name = ${exerciseName}
        GROUP BY el.exercise_name
        ORDER BY total_sets DESC
      `;
    } else {
      exerciseStats = await db.queryAll<{
        exercise_name: string;
        total_sets: number;
        completed_sets: number;
        avg_weight: number | null;
        max_weight: number | null;
        total_workouts: number;
      }>`
        SELECT 
          el.exercise_name,
          COUNT(*) as total_sets,
          COUNT(CASE WHEN el.completed = true THEN 1 END) as completed_sets,
          AVG(el.weight) as avg_weight,
          MAX(el.weight) as max_weight,
          COUNT(DISTINCT el.session_id) as total_workouts
        FROM exercise_logs el
        JOIN workout_sessions ws ON el.session_id = ws.id
        WHERE ws.started_at >= ${start} AND ws.started_at <= ${end}
        GROUP BY el.exercise_name
        ORDER BY total_sets DESC
      `;
    }

    return {
      stats: {
        totalWorkouts: sessionStats?.total_workouts || 0,
        completedWorkouts: sessionStats?.completed_workouts || 0,
        totalSetsCompleted: setsCompleted?.total || 0,
        mostFrequentDay: mostFrequent?.day_key || null,
        currentStreak: streak,
        exerciseStats: exerciseStats.map(stat => ({
          exerciseName: stat.exercise_name,
          totalSets: stat.total_sets,
          completedSets: stat.completed_sets,
          avgWeight: stat.avg_weight,
          maxWeight: stat.max_weight,
          totalWorkouts: stat.total_workouts
        }))
      }
    };
  }
);
