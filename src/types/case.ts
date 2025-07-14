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