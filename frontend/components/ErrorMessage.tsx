import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ title = "Erro", message, onRetry }: ErrorMessageProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground">{message}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Tentar novamente
          </Button>
        )}
      </div>
    </Card>
  );
}
