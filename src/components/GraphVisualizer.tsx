import { useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  buildSchema,
  GraphQLSchema,
  isObjectType,
  isScalarType,
  isEnumType,
  isInterfaceType,
  GraphQLObjectType,
} from "graphql";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface GraphVisualizerProps {
  schemaSDL: string;
  onReset: () => void;
}

const getNodeColor = (typeName: string): string => {
  if (typeName === "Query") return "hsl(var(--node-query))";
  if (typeName === "Mutation") return "hsl(var(--node-mutation))";
  return "hsl(var(--node-type))";
};

const getNodeStyle = (typeName: string) => ({
  background: getNodeColor(typeName),
  color: "hsl(var(--primary-foreground))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  padding: "12px",
  fontSize: "12px",
  fontFamily: "JetBrains Mono, monospace",
});

export const GraphVisualizer = ({ schemaSDL, onReset }: GraphVisualizerProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const schema = useMemo(() => {
    try {
      return buildSchema(schemaSDL);
    } catch (error) {
      toast.error("Invalid GraphQL schema: " + (error as Error).message);
      return null;
    }
  }, [schemaSDL]);

  useEffect(() => {
    if (!schema) return;

    const generatedNodes: Node[] = [];
    const generatedEdges: Edge[] = [];
    let nodeId = 0;

    const typeMap = schema.getTypeMap();
    const processedTypes = new Set<string>();

    // Position configuration
    const HORIZONTAL_SPACING = 300;
    const VERTICAL_SPACING = 150;
    let currentX = 0;
    let currentY = 0;
    let column = 0;
    const NODES_PER_COLUMN = 5;

    Object.keys(typeMap).forEach((typeName) => {
      // Skip introspection types
      if (typeName.startsWith("__")) return;

      const type = typeMap[typeName];
      
      if (isObjectType(type) || isInterfaceType(type)) {
        if (processedTypes.has(typeName)) return;
        processedTypes.add(typeName);

        const fields = type.getFields();
        const fieldList = Object.keys(fields).map((fieldName) => {
          const field = fields[fieldName];
          const fieldType = field.type.toString();
          return `${fieldName}: ${fieldType}`;
        });

        generatedNodes.push({
          id: `node-${nodeId}`,
          type: "default",
          data: {
            label: (
              <div>
                <div className="font-bold mb-2 text-sm">{typeName}</div>
                <div className="text-xs space-y-1">
                  {fieldList.map((field, idx) => (
                    <div key={idx} className="opacity-90">
                      {field}
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          position: { x: currentX, y: currentY },
          style: getNodeStyle(typeName),
        });

        // Create edges for relationships
        Object.keys(fields).forEach((fieldName) => {
          const field = fields[fieldName];
          const fieldTypeName = field.type.toString().replace(/[\[\]!]/g, "");
          
          if (typeMap[fieldTypeName] && !fieldTypeName.startsWith("__") && fieldTypeName !== typeName) {
            if (isObjectType(typeMap[fieldTypeName]) || isInterfaceType(typeMap[fieldTypeName])) {
              generatedEdges.push({
                id: `edge-${nodeId}-${fieldTypeName}`,
                source: `node-${nodeId}`,
                target: `node-${Array.from(processedTypes).indexOf(fieldTypeName)}`,
                animated: true,
                style: { stroke: "hsl(var(--primary))" },
              });
            }
          }
        });

        nodeId++;

        // Update position for next node
        currentY += VERTICAL_SPACING;
        if (nodeId % NODES_PER_COLUMN === 0) {
          column++;
          currentX = column * HORIZONTAL_SPACING;
          currentY = 0;
        }
      }
    });

    setNodes(generatedNodes);
    setEdges(generatedEdges);
    
    toast.success(`Visualized ${generatedNodes.length} types with ${generatedEdges.length} relationships`);
  }, [schema, setNodes, setEdges]);

  if (!schema) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-card rounded-lg border border-border">
        <p className="text-muted-foreground">Invalid schema. Please check your SDL.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Schema Visualization</h2>
        <Button variant="secondary" onClick={onReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          New Schema
        </Button>
      </div>
      <div className="h-[600px] bg-card rounded-lg border border-border overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const style = node.style as { background?: string };
              return style?.background || "hsl(var(--node-type))";
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
};
