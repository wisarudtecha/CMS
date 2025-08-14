// /src/types/workflow.ts
import { FormManager } from "@/components/interface/FormField";
import type { WorkflowStep, WorkflowTrigger, WorkflowVariable } from "@/types";
import type { CaseStatus } from "@/types/case";
import type { UserGroup, UserProfile } from "@/types/user";

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
  label?: string;
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
  };
}

export interface WorkflowCreateData {
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  variables?: WorkflowVariable[];
  tags?: string[];
}

export interface WorkflowEditorComponentProps {
  caseStatuses?: CaseStatus[];
  forms?: FormManager[];
  initialData?: WorkflowData;
  users?: UserProfile[];
  userGroup?: UserGroup[];
  workflowData?: WorkflowData;
  workflowId?: string;
  onSave?: (data: WorkflowData) => void;
}

export type ConnectionType = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

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
