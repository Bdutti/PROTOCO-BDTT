import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkoutDay } from "../types";

interface WorkoutTabsProps {
  days: WorkoutDay[];
  activeDay: number;
  onDayChange: (index: number) => void;
}

export function WorkoutTabs({ days, activeDay, onDayChange }: WorkoutTabsProps) {
  return (
    <Tabs value={activeDay.toString()} onValueChange={(v) => onDayChange(parseInt(v))}>
      <TabsList className="w-full grid grid-cols-3 lg:grid-cols-6 h-auto gap-2">
        {days.map((day, index) => (
          <TabsTrigger
            key={day.dayKey}
            value={index.toString()}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {day.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
