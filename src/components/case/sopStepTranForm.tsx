import { CaseSop } from "@/store/api/dispatch";
import { CaseStatusInterface } from "../ui/status/status";

interface ProgressSteps {
    id: string; // Changed from number to string
    title: string;
    completed: boolean;
    current?: boolean;
    type?: string;
    description?: string;
}

interface ProgressLane {
    id: string;
    name: string;
    steps: ProgressSteps[];
    isActive: boolean;
}

// Helper function to check if a node is a delay node
const isDelayNode = (node: any): boolean => {
    const label = node.data?.data?.label || '';
    return label.toLowerCase().includes('delay');
};

// const mapSopToProgressSteps = (sopData: CaseSop): Array<{
//     id: string;
//     title: string;
//     completed: boolean;
//     current?: boolean;
//     description?: string;
//     type?: string;
// }> => {
//     if (!sopData?.sop || !sopData?.currentStage) {
//         return [];
//     }

//     // Get workflow connections
//     const connections = sopData.sop.find(item => item.section === "connections")?.data || [];

//     // Get ALL nodes first (we'll filter later)
//     const allNodes = sopData.sop.filter(item =>
//         item.section === "nodes" &&
//         item.type !== "start" &&
//         item.type !== "end"
//     );

//     // Filter out only delay nodes for display
//     const displayNodes = allNodes.filter(node => !isDelayNode(node));

//     // Build execution order using ALL nodes but only display non-delay ones
//     const buildExecutionOrder = () => {
//         const orderMap: string[] = [];
//         const visited = new Set<string>();

//         // Find start node
//         const startNode = sopData.sop.find(item => item.type === "start");
//         if (!startNode) return displayNodes.map(n => n.nodeId);

//         const traverse = (nodeId: string) => {
//             if (visited.has(nodeId)) return;
//             visited.add(nodeId);

//             // Check if this node should be displayed (not a delay node)
//             const node = displayNodes.find(n => n.nodeId === nodeId);
//             if (node) {
//                 orderMap.push(nodeId);
//             }

//             // Continue traversal regardless of whether we display this node
//             const nextConnections = connections.filter((conn: any) => conn.source === nodeId);
//             nextConnections.forEach((conn: any) => {
//                 traverse(conn.target);
//             });
//         };

//         // Start traversal
//         const startConnections = connections.filter((conn: any) => conn.source === startNode.nodeId);
//         startConnections.forEach((conn: any) => {
//             traverse(conn.target);
//         });

//         return orderMap;
//     };

//     const executionOrder = buildExecutionOrder();

//     // Handle current node - if it's a delay node, find the related non-delay node
//     let effectiveCurrentNodeId = sopData.currentStage.nodeId;
//     const currentNode = allNodes.find(item => item.nodeId === sopData.currentStage.nodeId);

//     if (currentNode && isDelayNode(currentNode)) {
//         // If current is a delay node, find the next non-delay node
//         const nextConnections = connections.filter((conn: any) => conn.source === sopData.currentStage.nodeId);
//         for (const conn of nextConnections) {
//             const nextNode = displayNodes.find(item => item.nodeId === conn.target);
//             if (nextNode) {
//                 effectiveCurrentNodeId = conn.target;
//                 break;
//             }
//         }
//     }

//     const currentIndex = executionOrder.indexOf(effectiveCurrentNodeId);

//     return executionOrder.map((nodeId, index) => {
//         const node = displayNodes.find(n => n.nodeId === nodeId);
//         if (!node) return null;

//         const isCompleted = index < currentIndex;
//         const isCurrent = index === currentIndex;

//         return {
//             id: node.nodeId, // This is already a string
//             title: node.data?.data?.label || `Step ${index + 1}`,
//             description: node.data?.data?.description,
//             completed: isCompleted,
//             current: isCurrent,
//             type: node.type,
//         };
//     }).filter(Boolean) as Array<{
//         id: string;
//         title: string;
//         completed: boolean;
//         current?: boolean;
//         description?: string;
//         type?: string;
//     }>;
// };

export const mapSopToSimpleProgress = (sopData: CaseSop): ProgressSteps[] => {
    if (!sopData?.sop || !sopData?.currentStage) {
        return [];
    }

    // Get all nodes and filter out delays and non-relevant types
    const allNodes = sopData.sop.filter(item => item.section === "nodes");

    // Get displayable nodes (process and dispatch, but not delays)
    const displayNodes = allNodes
        .filter(item =>
            (item.type === "process" || item.type === "dispatch") &&
            !isDelayNode(item)
        )
        .sort((a, b) => {
            const aY = a.data?.position?.y || 0;
            const bY = b.data?.position?.y || 0;
            return aY - bY;
        });

    // Handle current stage
    let effectiveCurrentNodeId = sopData.currentStage.nodeId;
    const currentNode = allNodes.find(item => item.nodeId === sopData.currentStage.nodeId);

    // If current is delay or decision, find the next relevant node
    if (currentNode && (isDelayNode(currentNode) || currentNode.type === "decision")) {
        const connections = sopData.sop.find(item => item.section === "connections")?.data || [];
        const nextConnections = connections.filter((conn: any) => conn.source === sopData.currentStage.nodeId);

        for (const conn of nextConnections) {
            const nextNode = displayNodes.find(n => n.nodeId === conn.target);
            if (nextNode) {
                effectiveCurrentNodeId = conn.target;
                break;
            }
        }
    }

    let foundCurrent = false;

    return displayNodes.map((node, index) => {
        const isCompleted = !foundCurrent && node.nodeId !== effectiveCurrentNodeId;
        const isCurrent = node.nodeId === effectiveCurrentNodeId;

        if (isCurrent) {
            foundCurrent = true;
        }

        return {
            id: (index + 1).toString(), // Convert number to string
            title: node.data?.data?.label || `Step ${index + 1}`,
            completed: isCompleted,
            current: isCurrent,
            type: node.type,
            description: node.data?.data?.description
        };
    });
};

// Simplified version that just shows main workflow nodes in order
export const mapSopToOrderedProgress = (sopData: CaseSop): ProgressSteps[] => {
    if (!sopData?.sop || !sopData?.currentStage) {
        return [];
    }
    
    const caseStatus = JSON.parse(localStorage.getItem("caseStatus") ?? "[]") as CaseStatusInterface[];
    const slaTimelines = sopData.slaTimelines || [];
    
    // Get main workflow nodes (process and dispatch types, excluding delays)
    const workflowNodes = sopData.sop
        .filter(item =>
            item.section === "nodes" &&
            (item.type === "process" || item.type === "dispatch") &&
            !isDelayNode(item)
        )
        .sort((a, b) => {
            // Sort by vertical position (Y coordinate)
            const aY = a.data?.position?.y || 0;
            const bY = b.data?.position?.y || 0;
            return aY - bY;
        });

    // Find current stage position
    const currentNodeId = sopData.currentStage.nodeId;
    const currentNode = sopData.sop.find(item => item.nodeId === currentNodeId);

    // If current node is delay or decision, find the next workflow node
    let effectiveCurrentIndex = -1;
    if (currentNode && (isDelayNode(currentNode) || currentNode.type === "decision")) {
        // For delay/decision nodes, mark the next workflow step as current
        const connections = sopData.sop.find(item => item.section === "connections")?.data || [];
        const nextConnections = connections.filter((conn: any) => conn.source === currentNodeId);

        for (const conn of nextConnections) {
            const nextWorkflowIndex = workflowNodes.findIndex(n => n.nodeId === conn.target);
            if (nextWorkflowIndex !== -1) {
                effectiveCurrentIndex = nextWorkflowIndex;
                break;
            }
        }
    } else {
        // Current node is a workflow node
        effectiveCurrentIndex = workflowNodes.findIndex(n => n.nodeId === currentNodeId);
    }

    return workflowNodes.map((node, index) => {
        const isCompleted = effectiveCurrentIndex !== -1 && index < effectiveCurrentIndex;
        const isCurrent = index === effectiveCurrentIndex;
        
        // Find corresponding timeline data
        const statusId = node.data?.data?.config?.action;
        // const timelineData = slaTimelines.find(timeline => timeline.statusId === statusId);
        
        // Get the latest timeline entry for this status (in case there are multiple)
        const latestTimelineData = slaTimelines
            .filter(timeline => timeline.statusId === statusId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        return {
            id: (index + 1).toString(),
            title: caseStatus.find((item) => statusId === item.statusId)?.en || `Step ${index + 1}`,
            completed: isCompleted,
            current: isCurrent,
            type: node.type,
            description: node.data?.data?.description,
            timeline: latestTimelineData ? {
                completedAt: latestTimelineData.createdAt,
                duration: latestTimelineData.duration,
                userOwner: latestTimelineData.userOwner
            } : undefined
        };
    });
};

// Keep the other functions but update them to be more robust
export const mapSopToProgressStepsWithBranching = (sopData: CaseSop): ProgressSteps[] => {
    // Use the simpler ordered approach for now
    return mapSopToOrderedProgress(sopData);
};

export const buildProgressLanes = (sopData: CaseSop): ProgressLane[] => {
    return [{
        id: "main",
        name: "Main Flow",
        steps: mapSopToOrderedProgress(sopData),
        isActive: true
    }];
};

// const buildStepsForBranch = (startNodeId: string, sopData: CaseSop, connections: any[], nodes: any[]): ProgressSteps[] => {
//     return mapSopToOrderedProgress(sopData);
// };

// const isNodeInCurrentPath = (nodeId: string, currentNodeId: string, connections: any[], _nodes: any[]): boolean => {
//     return true; // Simplified for now
// };
