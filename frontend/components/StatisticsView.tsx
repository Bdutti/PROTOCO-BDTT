import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { TrendingUp, Target, Zap, Calendar } from "lucide-react";

interface StatisticsViewProps {
  dayKey?: string;
  exerciseName?: string;
  startDate?: string;
  endDate?: string;
}

export function StatisticsView({ dayKey, exerciseName, startDate, endDate }: StatisticsViewProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["statistics", dayKey, exerciseName, startDate, endDate],
    queryFn: () => backend.history.getStatistics({ dayKey, exerciseName, startDate, endDate }),
  });

  if (isLoading) {
    return <LoadingSpinner text="Carregando estatísticas..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Erro ao carregar estatísticas"
        message={error instanceof Error ? error.message : "Erro desconhecido"}
        onRetry={() => refetch()}
      />
    );
  }

  if (!data) {
    return null;
  }

  const stats = data.stats;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <div className="text-sm text-muted-foreground">Treinos</div>
          </div>
          <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
          <div className="text-xs text-muted-foreground">
            {stats.completedWorkouts} concluídos
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-4 w-4 text-green-600" />
            <div className="text-sm text-muted-foreground">Séries</div>
          </div>
          <div className="text-2xl font-bold">{stats.totalSetsCompleted}</div>
          <div className="text-xs text-muted-foreground">completadas</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-4 w-4 text-orange-600" />
            <div className="text-sm text-muted-foreground">Sequência</div>
          </div>
          <div className="text-2xl font-bold">{stats.currentStreak}</div>
          <div className="text-xs text-muted-foreground">dias</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <div className="text-sm text-muted-foreground">Favorito</div>
          </div>
          <div className="text-sm font-bold truncate">
            {stats.mostFrequentDay || "N/A"}
          </div>
        </Card>
      </div>

      {stats.exerciseStats.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Estatísticas por Exercício</h3>
          <div className="space-y-3">
            {stats.exerciseStats.slice(0, 10).map((exerciseStat) => (
              <div key={exerciseStat.exerciseName} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-sm">{exerciseStat.exerciseName}</div>
                  <div className="text-xs text-muted-foreground">
                    {exerciseStat.completedSets}/{exerciseStat.totalSets} séries
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{exerciseStat.totalWorkouts} treinos</span>
                  {exerciseStat.maxWeight && (
                    <span>Máximo: {exerciseStat.maxWeight}kg</span>
                  )}
                  {exerciseStat.avgWeight && (
                    <span>Média: {exerciseStat.avgWeight.toFixed(1)}kg</span>
                  )}
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{
                      width: `${
                        (exerciseStat.completedSets / exerciseStat.totalSets) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
