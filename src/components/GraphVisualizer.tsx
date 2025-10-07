import { useMemo } from "react";
import { Voyager } from "graphql-voyager";
import "graphql-voyager/dist/voyager.css";
import { buildSchema } from "graphql";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface GraphVisualizerProps {
  schemaSDL: string;
  onReset: () => void;
}

export const GraphVisualizer = ({ schemaSDL, onReset }: GraphVisualizerProps) => {
  const schema = useMemo(() => {
    try {
      const parsedSchema = buildSchema(schemaSDL);
      toast.success("Schema loaded successfully!");
      return parsedSchema;
    } catch (error) {
      toast.error("Invalid GraphQL schema: " + (error as Error).message);
      return null;
    }
  }, [schemaSDL]);

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
      <div className="h-[calc(100vh-200px)] bg-card rounded-lg border border-border overflow-hidden">
        <Voyager
          introspection={schema}
          displayOptions={{
            skipRelay: true,
            skipDeprecated: true,
            sortByAlphabet: false,
            showLeafFields: true,
          }}
          hideVoyagerLogo={true}
        />
      </div>
    </div>
  );
};
