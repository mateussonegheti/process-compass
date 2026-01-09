import { FileText } from "lucide-react";

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-foreground/10 rounded-lg">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">COGEDE</h1>
            <p className="text-sm text-primary-foreground/80">
              Comissão de Gestão Documental - Avaliação e Merge
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
