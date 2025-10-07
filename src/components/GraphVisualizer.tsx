import { useMemo } from "react";
import { Voyager } from "graphql-voyager";
import "graphql-voyager/dist/voyager.css";
import { buildSchema, getIntrospectionQuery, graphqlSync } from "graphql";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface GraphVisualizerProps {
  schemaSDL: string;
  onReset: () => void;
}

export const GraphVisualizer = ({ schemaSDL, onReset }: GraphVisualizerProps) => {
  const introspection = useMemo(() => {
    try {
      const schema = buildSchema(schemaSDL);
      const introspectionQuery = getIntrospectionQuery();
      const result = graphqlSync({
        schema,
        source: introspectionQuery,
      });
      
      if (result.errors) {
        toast.error("Failed to introspect schema: " + result.errors[0].message);
        return null;
      }
      
      toast.success("Schema loaded successfully!");
      return result.data;
    } catch (error) {
      toast.error("Invalid GraphQL schema: " + (error as Error).message);
      return null;
    }
  }, [schemaSDL]);

  if (!introspection) {
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
          introspection={introspection}
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
