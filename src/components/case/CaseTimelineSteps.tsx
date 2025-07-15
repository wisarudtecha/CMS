// /src/components/case/CaseTimelineSteps.tsx
import type { TimelineStep } from "@/types/case";

// Utility function to create timeline steps from case status
export const CaseTimelineSteps = (
  caseStatus: string,
  createdAt: string,
  resolvedAt?: string
): TimelineStep[] => {
  const baseSteps: Omit<TimelineStep, "status">[] = [
    {
      id: "received",
      label: "Received",
      description: "Case has been submitted",
      timestamp: createdAt
    },
    {
      id: "assigned",
      label: "Assigned",
      description: "Case assigned to team member"
    },
    {
      id: "acknowledged",
      label: "Acknowledged",
      description: "Assignment confirmed"
    },
    {
      id: "en-route",
      label: "En Route",
      description: "Team member en route to location"
    },
    {
      id: "on-site",
      label: "On Site",
      description: "Team member arrived at location"
    },
    {
      id: "completed",
      label: "Completed",
      description: "Case has been resolved",
      timestamp: resolvedAt
    }
  ];

  // Determine step statuses based on case status
  const steps = baseSteps.map((step, index): TimelineStep => {
    let status: TimelineStep["status"] = "pending";

    switch (caseStatus) {
      case "open":
        if (index === 0) status = "completed";
        else if (index === 1) status = "active";
        break;
      case "in-progress":
        if (index <= 2) status = "completed";
        else if (index === 3) status = "active";
        break;
      case "resolved":
      case "closed":
        if (index < baseSteps.length - 1) status = "completed";
        else status = "completed";
        break;
      case "escalated":
        if (index <= 1) status = "completed";
        else if (index === 2) status = "error";
        else status = "pending";
        break;
      default:
        if (index === 0) status = "completed";
        break;
    }

    return { ...step, status };
  });

  return steps;
};
