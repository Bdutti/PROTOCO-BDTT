import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SetButtonProps {
  setNumber: number;
  completed: boolean;
  onClick: () => void;
}

export function SetButton({ setNumber, completed, onClick }: SetButtonProps) {
  return (
    <Button
      variant={completed ? "default" : "outline"}
      size="icon"
      className={cn(
        "h-12 w-12 rounded-full transition-all duration-300",
        completed && "bg-blue-600 hover:bg-blue-700 border-blue-600"
      )}
      onClick={onClick}
    >
      {completed ? <Check className="h-5 w-5" /> : setNumber}
    </Button>
  );
}
