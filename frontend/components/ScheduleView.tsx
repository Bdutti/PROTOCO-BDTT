import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { Calendar, Clock, Plus, Trash2, Edit } from "lucide-react";
import { ScheduleForm } from "./ScheduleForm";

interface ScheduleViewProps {
  workoutDays: Array<{ dayKey: string; name: string }>;
}

export function ScheduleView({ workoutDays }: ScheduleViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["schedules"],
    queryFn: () => backend.schedule.getSchedules({ activeOnly: false }),
  });

  const deleteMutation = useMutation({
    mutationFn: (scheduleId: number) => backend.schedule.deleteSchedule({ scheduleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ scheduleId, active }: { scheduleId: number; active: boolean }) =>
      backend.schedule.updateSchedule({ scheduleId, active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  const handleDelete = (scheduleId: number) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      deleteMutation.mutate(scheduleId);
    }
  };

  const handleToggle = (scheduleId: number, currentActive: boolean) => {
    toggleMutation.mutate({ scheduleId, active: !currentActive });
  };

  const dayOfWeekMap: Record<string, string> = {
    monday: "Segunda",
    tuesday: "Terça",
    wednesday: "Quarta",
    thursday: "Quinta",
    friday: "Sexta",
    saturday: "Sábado",
    sunday: "Domingo",
  };

  if (isLoading) {
    return <LoadingSpinner text="Carregando agendamentos..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Erro ao carregar agendamentos"
        message={error instanceof Error ? error.message : "Erro desconhecido"}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Agendamentos</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {showForm && (
        <ScheduleForm
          workoutDays={workoutDays}
          onClose={() => {
            setShowForm(false);
            setEditingSchedule(null);
          }}
          editingScheduleId={editingSchedule}
        />
      )}

      {!data || data.schedules.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum agendamento criado ainda</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.schedules.map((schedule) => (
            <Card
              key={schedule.id}
              className={`p-4 ${!schedule.active ? "opacity-50" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div>
                    <h3 className="font-semibold">{schedule.dayName}</h3>
                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {dayOfWeekMap[schedule.scheduledDay] || schedule.scheduledDay}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {schedule.scheduledTime}
                      </div>
                    </div>
                  </div>

                  {schedule.reminders.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Lembretes: {schedule.reminders.map((r) => r.reminderTime).join(", ")}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(schedule.id, schedule.active)}
                  >
                    {schedule.active ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(schedule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
