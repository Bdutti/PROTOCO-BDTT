import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WorkoutTracker } from "./components/WorkoutTracker";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="dark min-h-screen bg-background text-foreground">
        <WorkoutTracker />
      </div>
    </QueryClientProvider>
  );
}
