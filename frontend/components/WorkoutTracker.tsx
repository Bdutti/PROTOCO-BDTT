import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import { WorkoutTabs } from "./WorkoutTabs";
import { ExerciseCard } from "./ExerciseCard";
import { ProgressBar } from "./ProgressBar";
import { RestTimerModal } from "./RestTimerModal";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useRestTimer } from "../hooks/useRestTimer";
import type { Exercise, WorkoutDay, SetProgress } from "../types";

export function WorkoutTracker() {
  const [activeDay, setActiveDay] = useState(0);
  const queryClient = useQueryClient();
  const restTimer = useRestTimer({ duration: 90 });

  const { data: workoutsData, isLoading: workoutsLoading, error: workoutsError, refetch: refetchWorkouts } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => backend.workout.getWorkouts(),
  });

  const currentDayKey = workoutsData?.days[activeDay]?.dayKey;

  const { data: progressData, isLoading: progressLoading, error: progressError } = useQuery({
    queryKey: ["progress", currentDayKey],
    queryFn: () => backend.progress.getProgress({ dayKey: currentDayKey! }),
    enabled: !!currentDayKey,
  });

  const toggleMutation = useMutation({
    mutationFn: (params: { dayKey: string; exerciseName: string; setIndex: number }) =>
      backend.progress.toggle(params),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["progress", variables.dayKey] });
      if (data.completed) {
        restTimer.start();
      }
    },
  });

  const resetMutation = useMutation({
    mutationFn: (dayKey: string) => backend.progress.reset({ dayKey }),
    onSuccess: (_, dayKey) => {
      queryClient.invalidateQueries({ queryKey: ["progress", dayKey] });
    },
  });

  const handleToggleSet = (exerciseName: string, setIndex: number) => {
    if (!currentDayKey) return;
    toggleMutation.mutate({ dayKey: currentDayKey, exerciseName, setIndex });
  };

  const handleResetDay = () => {
    if (!currentDayKey) return;
    if (confirm("Are you sure you want to reset all progress for this day?")) {
      resetMutation.mutate(currentDayKey);
    }
  };

  const getSetCompleted = (exerciseName: string, setIndex: number): boolean => {
    if (!progressData) return false;
    return progressData.progress.some(
      (p) => p.exerciseName === exerciseName && p.setIndex === setIndex && p.completed
    );
  };

  const calculateProgress = (): number => {
    if (!workoutsData || !progressData) return 0;
    const currentDay = workoutsData.days[activeDay];
    if (!currentDay) return 0;

    const totalSets = currentDay.exercises.reduce((sum, ex) => sum + ex.series, 0);
    const completedSets = progressData.progress.filter((p) => p.completed).length;

    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  };

  if (workoutsLoading) {
    return <LoadingSpinner text="Carregando treinos..." fullScreen />;
  }

  if (workoutsError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <ErrorMessage
          title="Erro ao carregar treinos"
          message={workoutsError instanceof Error ? workoutsError.message : "Erro desconhecido"}
          onRetry={() => refetchWorkouts()}
        />
      </div>
    );
  }

  if (!workoutsData) {
    return <LoadingSpinner text="Carregando treinos..." fullScreen />;
  }

  const currentDay = workoutsData.days[activeDay];

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">PPL Workout Tracker</h1>
        <p className="text-muted-foreground">Track your Push, Pull, and Legs workouts</p>
      </div>

      <WorkoutTabs
        days={workoutsData.days}
        activeDay={activeDay}
        onDayChange={setActiveDay}
      />

      <ProgressBar progress={calculateProgress()} />

      <div className="mt-6 space-y-4">
        {currentDay?.exercises.map((exercise, index) => (
          <ExerciseCard
            key={index}
            exercise={exercise}
            onToggleSet={(setIndex) => handleToggleSet(exercise.name, setIndex)}
            getSetCompleted={(setIndex) => getSetCompleted(exercise.name, setIndex)}
          />
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResetDay}
            disabled={resetMutation.isPending}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Progress
          </Button>
        </div>
      </div>

      <RestTimerModal
        isOpen={restTimer.isOpen}
        onClose={restTimer.skip}
        timeLeft={restTimer.timeLeft}
        formatTime={restTimer.formatTime}
      />
    </div>
  );
}
