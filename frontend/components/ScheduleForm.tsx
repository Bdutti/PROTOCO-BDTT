import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ScheduleFormProps {
  workoutDays: Array<{ dayKey: string; name: string }>;
  onClose: () => void;
  editingScheduleId?: number | null;
}

export function ScheduleForm({ workoutDays, onClose, editingScheduleId }: ScheduleFormProps) {
  const [dayKey, setDayKey] = useState("");
  const [scheduledDay, setScheduledDay] = useState("monday");
  const [scheduledTime, setScheduledTime] = useState("08:00");
  const [reminders, setReminders] = useState<string[]>([]);
  const [newReminder, setNewReminder] = useState("07:30");
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (params: {
      dayKey: string;
      scheduledDay: string;
      scheduledTime: string;
      reminders?: string[];
    }) => backend.schedule.createSchedule(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayKey) {
      alert("Selecione um treino");
      return;
    }
    createMutation.mutate({
      dayKey,
      scheduledDay,
      scheduledTime,
      reminders: reminders.length > 0 ? reminders : undefined,
    });
  };

  const addReminder = () => {
    if (newReminder && !reminders.includes(newReminder)) {
      setReminders([...reminders, newReminder]);
      setNewReminder("07:30");
    }
  };

  const removeReminder = (reminder: string) => {
    setReminders(reminders.filter((r) => r !== reminder));
  };

  const daysOfWeek = [
    { value: "monday", label: "Segunda-feira" },
    { value: "tuesday", label: "Terça-feira" },
    { value: "wednesday", label: "Quarta-feira" },
    { value: "thursday", label: "Quinta-feira" },
    { value: "friday", label: "Sexta-feira" },
    { value: "saturday", label: "Sábado" },
    { value: "sunday", label: "Domingo" },
  ];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Novo Agendamento</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Treino</label>
          <select
            value={dayKey}
            onChange={(e) => setDayKey(e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-background"
            required
          >
            <option value="">Selecione um treino</option>
            {workoutDays.map((day) => (
              <option key={day.dayKey} value={day.dayKey}>
                {day.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Dia da Semana</label>
          <select
            value={scheduledDay}
            onChange={(e) => setScheduledDay(e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-background"
            required
          >
            {daysOfWeek.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Horário</label>
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-background"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Lembretes</label>
          <div className="flex space-x-2 mb-2">
            <input
              type="time"
              value={newReminder}
              onChange={(e) => setNewReminder(e.target.value)}
              className="flex-1 p-2 border border-border rounded-md bg-background"
            />
            <Button type="button" onClick={addReminder} variant="outline">
              Adicionar
            </Button>
          </div>
          {reminders.length > 0 && (
            <div className="space-y-2">
              {reminders.map((reminder) => (
                <div
                  key={reminder}
                  className="flex justify-between items-center p-2 bg-muted rounded-md"
                >
                  <span className="text-sm">{reminder}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeReminder(reminder)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
