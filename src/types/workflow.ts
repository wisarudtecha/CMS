// /src/types/workflow.ts
export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "draft" | "testing";
  createdAt: string;
  lastRun?: string;
  runCount: number;
  category?: string;
  tags?: string[];
  author?: string;
  version?: string;
  config?: unknown;
}

export interface Position {
  x: number;
  y: number;
}

export interface WorkflowNode {
  id: string;
  type: "start" | "process" | "decision" | "end";
  position: Position;
  data: {
    label: string;
    description?: string;
    config?: Record<string, unknown>;
  };
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string; // For Yes/No labels
}

export interface WorkflowData {
  nodes: WorkflowNode[];
  connections: Connection[];
  metadata: {
    title: string;
    description: string;
    status: "draft" | "active" | "inactive" | "testing";
    createdAt?: string;
    updatedAt?: string;
    // Case Management System fields
    casePriority?: string;
    caseCategory?: string;
    targetCaseStatus?: string;
  };
}

export interface WorkflowEditorComponentProps {
  initialData?: WorkflowData;
  workflowId?: string; // For loading from URL
  onSave?: (data: WorkflowData) => void;
}

export type NodeType = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    description: string;
    config?: Record<string, unknown>;
  };
};

export type ConnectionType = {
  id: string;
  source: string;
  target: string;
  label?: string;
};
