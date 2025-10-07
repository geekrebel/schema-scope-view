import { useState } from "react";
import { SchemaInput } from "@/components/SchemaInput";
import { GraphVisualizer } from "@/components/GraphVisualizer";
import { Network } from "lucide-react";

const Index = () => {
  const [schema, setSchema] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Network className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">GraphQL Visualizer</h1>
              <p className="text-sm text-muted-foreground">
                Visualize your GraphQL schema instantly
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!schema ? (
          <div className="max-w-3xl mx-auto">
            <SchemaInput onSchemaLoad={setSchema} />
          </div>
        ) : (
          <GraphVisualizer schemaSDL={schema} onReset={() => setSchema(null)} />
        )}
      </main>
    </div>
  );
};

export default Index;
