import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RestTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeLeft: number;
  formatTime: (seconds: number) => string;
}

export function RestTimerModal({ isOpen, onClose, timeLeft, formatTime }: RestTimerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rest Timer</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-6xl font-bold text-blue-600 mb-2">
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-muted-foreground">Time remaining</div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full">
            Skip Rest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
