// /src/types/case.ts
export interface CaseEntity {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  status: "open" | "in-progress" | "resolved" | "closed" | "escalated";
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  assignedTo: string;
  reporter: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  resolvedAt?: string;
  tags: string[];
  attachments: Attachment[];
  comments: Comment[];
  customFields: Record<string, unknown>;
  location?: string;
  department?: string;
  estimatedHours?: number;
  actualHours?: number;
}

export interface Attachment {
  id: string;
  filename: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  isInternal: boolean;
}

export interface ProgressStep {
  key: string;
  label: string;
  completed: boolean;
  active: boolean;
  timestamp?: string;
}

export interface TimelineStep {
  id: string;
  label: string;
  description?: string;
  timestamp?: string;
  status: "completed" | "active" | "pending" | "error";
  icon?: React.ComponentType<{ className?: string }>;
  metadata?: Record<string, unknown>;
}

export interface ProgressTimelineProps {
  steps: TimelineStep[];
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  showTimestamps?: boolean;
  showDescriptions?: boolean;
  animated?: boolean;
  className?: string;
  onStepClick?: (step: TimelineStep, index: number) => void;
}
