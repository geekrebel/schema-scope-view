import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Code } from "lucide-react";
import { toast } from "sonner";

interface SchemaInputProps {
  onSchemaLoad: (schema: string) => void;
}

export const SchemaInput = ({ onSchemaLoad }: SchemaInputProps) => {
  const [schema, setSchema] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.graphql') && !file.name.endsWith('.gql')) {
      toast.error("Please upload a .graphql or .gql file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSchema(content);
      toast.success("Schema loaded successfully!");
    };
    reader.onerror = () => {
      toast.error("Error reading file");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleVisualize = () => {
    if (!schema.trim()) {
      toast.error("Please provide a GraphQL schema");
      return;
    }
    onSchemaLoad(schema);
  };

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-secondary rounded-full">
              <Upload className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Upload Schema File</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drop your .graphql or .gql file here, or click to browse
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".graphql,.gql"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>
        </div>
      </Card>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or paste SDL</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Code className="w-4 h-4" />
          GraphQL Schema Definition Language
        </label>
        <Textarea
          value={schema}
          onChange={(e) => setSchema(e.target.value)}
          placeholder="Paste your GraphQL SDL here...

Example:
type Query {
  user(id: ID!): User
  posts: [Post!]!
}

type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
}"
          className="min-h-[300px] font-mono text-sm bg-codeBg"
        />
      </div>

      <Button onClick={handleVisualize} className="w-full" size="lg">
        Visualize Schema
      </Button>
    </div>
  );
};
