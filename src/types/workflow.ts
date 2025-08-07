// /src/types/workflow.ts
import { FormManager } from "@/components/interface/FormField";
import type { CaseStatus } from "@/types/case";
import type { UserProfile } from "@/types/user";

// export interface Workflow {
//   id: string;
//   name: string;
//   description: string;
//   status: "active" | "inactive" | "draft" | "testing";
//   createdAt: string;
//   lastRun?: string;
//   runCount: number;
//   category?: string;
//   tags?: string[];
//   author?: string;
//   version?: string;
//   config?: unknown;
// }

export interface Workflow {
  id: string;
  orgId: string;
  wfId: string;
  title: string;
  desc: string;
  active: boolean;
  publish: boolean;
  locks: boolean;
  versions: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
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
  caseStatuses: CaseStatus[];
  forms?: FormManager[];
  initialData?: WorkflowData;
  users?: UserProfile[];
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
