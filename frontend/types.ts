export interface Exercise {
  name: string;
  series: number;
  reps: string;
  observations: string | null;
}

export interface WorkoutDay {
  dayKey: string;
  name: string;
  exercises: Exercise[];
}

export interface SetProgress {
  exerciseName: string;
  setIndex: number;
  completed: boolean;
}
