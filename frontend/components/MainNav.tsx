import { Home, History, BarChart3, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function MainNav({ activeView, onViewChange }: MainNavProps) {
  const navItems = [
    { id: "workout", label: "Treino", icon: Home },
    { id: "history", label: "Histórico", icon: History },
    { id: "statistics", label: "Estatísticas", icon: BarChart3 },
    { id: "schedule", label: "Agendamentos", icon: Calendar },
    { id: "export", label: "Exportar", icon: Download },
  ];

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex-1 rounded-none border-b-2 ${
                activeView === item.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
