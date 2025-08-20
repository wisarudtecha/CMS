// /src/components/case/CaseTimelineSteps.tsx
// import { useGetCaseSopQuery } from "@/store/api/dispatch";
import type { CaseSop } from "@/store/api/dispatch"; 
import type { TimelineStep } from "@/types/case";
import type { Connection } from "@/types/workflow"; 

// Utility function to create timeline steps from case status
export const CaseTimelineSteps = (
  // id?: string,
  // caseStatus?: string,
  // createdAt?: string,
  // resolvedAt?: string,
  sop?: CaseSop,
): TimelineStep[] => {
  const mapSOPToTimeline = (caseSop: CaseSop): TimelineStep[] => {
    const connections = caseSop.sop?.find(item => item.section === "connections")?.data || [];

    const noConnectionTargets = new Set(
      (connections as Connection[])
        .filter((conn: Connection) => conn.label === "no")
        .map((conn: Connection) => conn.target)
    );

    const processNodes = caseSop.sop
      ?.filter(node => node.type === "process"
        && !noConnectionTargets.has(node.nodeId)
      )
      // .filter(node => !node.data?.data?.label?.includes("Delay"))
      .sort((a, b) => {
        return a.data?.position?.y - b.data?.position?.y;
      });

    const currentNodeId = caseSop.currentStage?.nodeId;
    let currentStageFound = false;

    return processNodes?.map((node): TimelineStep => {
      const isCurrentStage = node.nodeId === currentNodeId;
      const actionId = node.data?.data?.config?.action;
      
      let status: TimelineStep['status'];
      if (isCurrentStage) {
        status = "active";
        currentStageFound = true;
      }
      else if (!currentStageFound) {
        status = "completed";
      }
      else {
        status = "pending";
      }

      // Map timestamps based on action IDs
      let timestamp: string | undefined;
      switch (actionId) {
        case "S000": timestamp = caseSop.createdDate; break;
        case "S001": timestamp = caseSop.createdDate; break;
        case "S002": timestamp = caseSop.startedDate; break;
        case "S003": timestamp = caseSop.commandedDate || undefined; break;
        case "S004": timestamp = caseSop.receivedDate || undefined; break;
        case "S005": timestamp = caseSop.receivedDate || undefined; break;
        case "S006": timestamp = caseSop.arrivedDate || undefined; break;
        case "S007": timestamp = caseSop.closedDate || undefined; break;
        case "S008": timestamp = caseSop.updatedAt || undefined; break;
        case "S009": timestamp = caseSop.updatedAt || undefined; break;
        case "S010": timestamp = caseSop.updatedAt || undefined; break;
        case "S011": timestamp = caseSop.updatedAt || undefined; break;
        case "S012": timestamp = caseSop.updatedAt || undefined; break;
        case "S013": timestamp = caseSop.updatedAt || undefined; break;
        case "S014": timestamp = caseSop.updatedAt || undefined; break;
        case "S015": timestamp = caseSop.startedDate || caseSop.receivedDate || undefined; break;
        case "S016": timestamp = caseSop.closedDate || undefined; break;
        case "S017": timestamp = caseSop.updatedAt || undefined; break;
        case "S018": timestamp = caseSop.updatedAt || undefined; break;
        case "S019": timestamp = caseSop.updatedAt || undefined; break;
        default: timestamp = undefined; break;
      }

      // Handle error status for cancelled or delayed items
      if (["S008", "S009", "S010", "S011", "S012", "S013", "S014"].includes(actionId)) {
        status = status === "active" ? "error" : status;
      }

      return {
        id: node.nodeId,
        label: node.data?.data?.label || "Unknown Step",
        description: `Action: ${actionId}`,
        timestamp,
        status,
        metadata: {
          actionId,
          nodeId: node.nodeId,
          formId: node.data?.data?.config?.formId,
          groups: node.data?.data?.config?.group,
          pic: node.data?.data?.config?.pic,
          sla: node.data?.data?.config?.sla,
          position: node.data?.position
        }
      };
    }) || [];
  };

  const timelineSteps: TimelineStep[] = sop ? mapSOPToTimeline(sop) : [];
  return timelineSteps;

  // const baseSteps: Omit<TimelineStep, "status">[] = [
  //   {
  //     id: "received",
  //     label: "Received",
  //     description: "Case has been submitted",
  //     timestamp: createdAt
  //   },
  //   {
  //     id: "assigned",
  //     label: "Assigned",
  //     description: "Case assigned to team member"
  //   },
  //   {
  //     id: "acknowledged",
  //     label: "Acknowledged",
  //     description: "Assignment confirmed"
  //   },
  //   {
  //     id: "en-route",
  //     label: "En Route",
  //     description: "Team member en route to location"
  //   },
  //   {
  //     id: "on-site",
  //     label: "On Site",
  //     description: "Team member arrived at location"
  //   },
  //   {
  //     id: "completed",
  //     label: "Completed",
  //     description: "Case has been resolved",
  //     timestamp: resolvedAt
  //   }
  // ];

  // Determine step statuses based on case status
  // const steps = baseSteps.map((step, index): TimelineStep => {
  //   let status: TimelineStep["status"] = "pending";

  //   switch (caseStatus) {
  //     case "open":
  //       if (index === 0) status = "completed";
  //       else if (index === 1) status = "active";
  //       break;
  //     case "in-progress":
  //       if (index <= 2) status = "completed";
  //       else if (index === 3) status = "active";
  //       break;
  //     case "resolved":
  //     case "closed":
  //       if (index < baseSteps.length - 1) status = "completed";
  //       else status = "completed";
  //       break;
  //     case "escalated":
  //       if (index <= 1) status = "completed";
  //       else if (index === 2) status = "error";
  //       else status = "pending";
  //       break;
  //     default:
  //       if (index === 0) status = "completed";
  //       break;
  //   }

  //   return { ...step, status };
  // });

  // return steps;
};
