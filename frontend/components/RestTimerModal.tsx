import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { playBeep } from "../lib/audio";

interface RestTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REST_DURATION = 90; // 90 seconds

export function RestTimerModal({ isOpen, onClose }: RestTimerModalProps) {
  const [timeLeft, setTimeLeft] = useState(REST_DURATION);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(REST_DURATION);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          playBeep();
          setTimeout(onClose, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onClose]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
