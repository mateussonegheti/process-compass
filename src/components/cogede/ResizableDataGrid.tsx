import { useState, useRef, useCallback, ReactNode } from "react";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc";

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessor: (row: T) => string | number;
  minWidth?: number;
  defaultWidth?: number;
  render?: (value: string | number, row: T) => ReactNode;
}

interface ResizableDataGridProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  sortColumn: string;
  sortDirection: SortDirection;
  onSort: (columnId: string) => void;
  keyExtractor: (row: T, index: number) => string;
}

export function ResizableDataGrid<T>({
  data,
  columns,
  sortColumn,
  sortDirection,
  onSort,
  keyExtractor,
}: ResizableDataGridProps<T>) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    columns.forEach((col) => {
      initial[col.id] = col.defaultWidth || 150;
    });
    return initial;
  });

  const resizingRef = useRef<{
    columnId: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, columnId: string) => {
      e.preventDefault();
      e.stopPropagation();
      
      resizingRef.current = {
        columnId,
        startX: e.clientX,
        startWidth: columnWidths[columnId] || 150,
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!resizingRef.current) return;
        
        const currentColumnId = resizingRef.current.columnId;
        const diff = e.clientX - resizingRef.current.startX;
        const minWidth = columns.find((c) => c.id === currentColumnId)?.minWidth || 60;
        const newWidth = Math.max(minWidth, resizingRef.current.startWidth + diff);
        
        setColumnWidths((prev) => ({
          ...prev,
          [currentColumnId]: newWidth,
        }));
      };

      const handleMouseUp = () => {
        resizingRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [columnWidths, columns]
  );

  const SortIcon = ({ columnId }: { columnId: string }) => {
    if (sortColumn !== columnId) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  const totalWidth = Object.values(columnWidths).reduce((sum, w) => sum + w, 0);

  return (
    <div className="rounded-md border overflow-auto max-h-[400px]">
      <div style={{ minWidth: totalWidth }}>
        <table className="w-full caption-bottom text-sm table-fixed">
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow className="bg-muted/50">
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    "font-semibold select-none relative",
                    "border-r border-border last:border-r-0"
                  )}
                  style={{ 
                    width: columnWidths[column.id],
                    minWidth: column.minWidth || 60,
                  }}
                >
                  <div 
                    className="flex items-center cursor-pointer hover:bg-muted/80 px-2 py-1 -mx-2 -my-1 rounded"
                    onClick={() => onSort(column.id)}
                  >
                    <span className="truncate">{column.header}</span>
                    <SortIcon columnId={column.id} />
                  </div>
                  
                  {/* Resize handle */}
                  <div
                    className={cn(
                      "absolute right-0 top-0 bottom-0 w-3 cursor-col-resize",
                      "flex items-center justify-center",
                      "hover:bg-primary/20 active:bg-primary/30",
                      "group"
                    )}
                    onMouseDown={(e) => handleMouseDown(e, column.id)}
                  >
                    <div className="w-0.5 h-4 bg-border group-hover:bg-primary/50 rounded" />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhum dado disponível
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIdx) => (
                <TableRow key={keyExtractor(row, rowIdx)} className="text-sm">
                  {columns.map((column) => {
                    const value = column.accessor(row);
                    return (
                      <TableCell
                        key={column.id}
                        className={cn(
                          "text-xs border-r border-border last:border-r-0",
                          "truncate"
                        )}
                        style={{ 
                          width: columnWidths[column.id],
                          maxWidth: columnWidths[column.id],
                          minWidth: column.minWidth || 60,
                        }}
                        title={String(value)}
                      >
                        {column.render ? column.render(value, row) : String(value) || "—"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </table>
      </div>
    </div>
  );
}