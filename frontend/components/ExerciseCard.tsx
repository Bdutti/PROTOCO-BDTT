import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SetButton } from "./SetButton";
import type { Exercise } from "../types";

interface ExerciseCardProps {
  exercise: Exercise;
  onToggleSet: (setIndex: number) => void;
  getSetCompleted: (setIndex: number) => boolean;
}

export function ExerciseCard({ exercise, onToggleSet, getSetCompleted }: ExerciseCardProps) {
  const sets = Array.from({ length: exercise.series }, (_, i) => i);

  return (
    <Card className="bg-card border-border transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{exercise.name}</CardTitle>
        <div className="text-sm text-muted-foreground">
          {exercise.series} séries × {exercise.reps} reps
          {exercise.observations && (
            <span className="block mt-1 text-xs italic">{exercise.observations}</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          {sets.map((setIndex) => (
            <SetButton
              key={setIndex}
              setNumber={setIndex + 1}
              completed={getSetCompleted(setIndex)}
              onClick={() => onToggleSet(setIndex)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
