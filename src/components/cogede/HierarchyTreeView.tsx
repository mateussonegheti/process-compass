import { useState, useCallback } from "react";
import { HierarchyTreeNode, buildHierarchyTree } from "@/lib/hierarchyParser";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronDown, Leaf, FolderOpen } from "lucide-react";

interface HierarchyTreeViewProps {
  records: Array<{
    codigo: number;
    nome: string;
    hierarchyLevel: number;
    isLeaf: boolean;
    temporalidade: string;
    tipoGuarda: string;
  }>;
  maxInitialDisplay?: number;
}

function TreeNodeItem({ node, depth = 0 }: { node: HierarchyTreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-0.5 hover:bg-muted/50 rounded px-1 cursor-pointer text-xs"
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )
        ) : (
          <Leaf className="h-3 w-3 text-muted-foreground flex-shrink-0 ml-0.5" />
        )}
        
        {!node.isLeaf ? (
          <FolderOpen className="h-3 w-3 text-primary flex-shrink-0" />
        ) : null}

        <span className="font-mono text-muted-foreground flex-shrink-0">{node.codigo}</span>
        <span className={`truncate ${node.isLeaf ? "text-foreground" : "font-medium text-foreground"}`}>
          {node.nome}
        </span>

        <Badge variant="outline" className="text-[10px] px-1 py-0 flex-shrink-0 ml-auto">
          N{node.hierarchyLevel}
        </Badge>
        {node.isLeaf && (
          <Badge variant="secondary" className="text-[10px] px-1 py-0 flex-shrink-0">
            folha
          </Badge>
        )}
        {node.temporalidade && (
          <Badge variant="default" className="text-[10px] px-1 py-0 flex-shrink-0">
            {node.temporalidade}
          </Badge>
        )}
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNodeItem key={child.codigo} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function HierarchyTreeView({ records, maxInitialDisplay = 500 }: HierarchyTreeViewProps) {
  const [showAll, setShowAll] = useState(false);

  const tree = useCallback(() => {
    const subset = showAll ? records : records.slice(0, maxInitialDisplay);
    return buildHierarchyTree(subset as any);
  }, [records, showAll, maxInitialDisplay])();

  const leafCount = records.filter(r => r.isLeaf).length;
  const branchCount = records.filter(r => !r.isLeaf).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{records.length} assuntos</span>
        <span>•</span>
        <span>{branchCount} categorias</span>
        <span>•</span>
        <span>{leafCount} folhas</span>
      </div>

      <div className="max-h-[400px] overflow-y-auto border rounded-lg p-2 bg-background">
        {tree.map((node) => (
          <TreeNodeItem key={node.codigo} node={node} depth={0} />
        ))}
      </div>

      {!showAll && records.length > maxInitialDisplay && (
        <button
          className="text-xs text-primary hover:underline"
          onClick={() => setShowAll(true)}
        >
          Mostrar todos os {records.length} registros (exibindo {maxInitialDisplay})
        </button>
      )}
    </div>
  );
}
