import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import backend from "~backend/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function ExportView() {
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const exportMutation = useMutation({
    mutationFn: () =>
      backend.dataexport.exportData({
        includeHistory: true,
        includeNotes: true,
        includeWeight: true,
        includeSchedules: true,
      }),
    onSuccess: (data) => {
      const blob = new Blob([data.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Exportação concluída",
        description: "Seus dados foram exportados com sucesso",
      });
    },
    onError: (error) => {
      console.error("Export error:", error);
      toast({
        title: "Erro na exportação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: (data: string) => backend.dataexport.importData({ data, overwrite: false }),
    onSuccess: (result) => {
      toast({
        title: "Importação concluída",
        description: `Importados: ${result.imported.sessions} treinos, ${result.imported.notes} notas, ${result.imported.weights} registros de peso, ${result.imported.schedules} agendamentos`,
      });
      setImporting(false);
    },
    onError: (error) => {
      console.error("Import error:", error);
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      setImporting(false);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importMutation.mutate(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">Exportar / Importar Dados</h2>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Exportar Dados</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Exporte todos os seus dados de treino, histórico, notas e agendamentos em formato JSON.
            </p>
            <Button
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {exportMutation.isPending ? "Exportando..." : "Exportar Dados"}
            </Button>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-lg font-semibold mb-2">Importar Dados</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Importe dados previamente exportados. Os dados existentes não serão sobrescritos.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file">
              <Button
                asChild
                variant="outline"
                disabled={importMutation.isPending}
                className="w-full"
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {importMutation.isPending ? "Importando..." : "Importar Dados"}
                </span>
              </Button>
            </label>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-muted">
        <p className="text-sm text-muted-foreground">
          <strong>Atenção:</strong> Os dados exportados contêm todo seu histórico de treinos.
          Guarde o arquivo em local seguro caso queira fazer backup.
        </p>
      </Card>
    </div>
  );
}
