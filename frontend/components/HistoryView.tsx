import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { Calendar, Check, X } from "lucide-react";

interface HistoryViewProps {
  dayKey?: string;
  limit?: number;
}

export function HistoryView({ dayKey, limit = 20 }: HistoryViewProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["history", dayKey, limit],
    queryFn: () => backend.history.getHistory({ dayKey, limit }),
  });

  if (isLoading) {
    return <LoadingSpinner text="Carregando histórico..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Erro ao carregar histórico"
        message={error instanceof Error ? error.message : "Erro desconhecido"}
        onRetry={() => refetch()}
      />
    );
  }

  if (!data || data.sessions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nenhum treino registrado ainda</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {data.sessions.map((session) => (
        <Card key={session.sessionId} className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-lg">{session.dayName}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(session.startedAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                {session.completedExercises}/{session.totalExercises} exercícios
              </div>
              {session.completedAt && (
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <Check className="h-3 w-3 mr-1" />
                  Concluído
                </div>
              )}
            </div>
          </div>

          {session.notes && (
            <div className="mb-4 p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">{session.notes}</p>
            </div>
          )}

          <div className="space-y-2">
            {session.exercises.length > 0 && (
              <div className="grid gap-2">
                {Object.entries(
                  session.exercises.reduce((acc, ex) => {
                    if (!acc[ex.exerciseName]) {
                      acc[ex.exerciseName] = [];
                    }
                    acc[ex.exerciseName].push(ex);
                    return acc;
                  }, {} as Record<string, typeof session.exercises>)
                ).map(([exerciseName, sets]) => (
                  <div key={exerciseName} className="text-sm">
                    <div className="font-medium mb-1">{exerciseName}</div>
                    <div className="flex flex-wrap gap-2">
                      {sets.map((set) => (
                        <div
                          key={set.setNumber}
                          className={`px-2 py-1 rounded text-xs ${
                            set.completed
                              ? "bg-green-600/20 text-green-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          Série {set.setNumber + 1}
                          {set.weight && set.reps && (
                            <span className="ml-1">
                              {set.weight}kg × {set.reps}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
