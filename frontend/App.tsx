import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WorkoutTracker } from "./components/WorkoutTracker";
import { HistoryView } from "./components/HistoryView";
import { StatisticsView } from "./components/StatisticsView";
import { ScheduleView } from "./components/ScheduleView";
import { ExportView } from "./components/ExportView";
import { MainNav } from "./components/MainNav";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function AppInner() {
  const [activeView, setActiveView] = useState("workout");

  const { data: workoutsData } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => backend.workout.getWorkouts(),
  });

  const renderView = () => {
    switch (activeView) {
      case "workout":
        return <WorkoutTracker />;
      case "history":
        return <HistoryView />;
      case "statistics":
        return <StatisticsView />;
      case "schedule":
        return (
          <ScheduleView
            workoutDays={workoutsData?.days.map((d) => ({ dayKey: d.dayKey, name: d.name })) || []}
          />
        );
      case "export":
        return <ExportView />;
      default:
        return <WorkoutTracker />;
    }
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <MainNav activeView={activeView} onViewChange={setActiveView} />
      <div className="max-w-4xl mx-auto p-4">
        {renderView()}
      </div>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
