import { CaseSop } from "@/store/api/dispatch";
import { CaseStatusInterface } from "../ui/status/status";

interface ProgressSteps {
    id: string;
    title: string;
    completed: boolean;
    current?: boolean;
    type?: string;
    description?: string;
    sla?: number;
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
export const mapSopToOrderedProgress = (sopData: CaseSop, language: string): ProgressSteps[] => {
    if (!sopData?.sop || !sopData?.currentStage) {
        return [];
    }

    const caseStatus = JSON.parse(localStorage.getItem("caseStatus") ?? "[]") as CaseStatusInterface[];
    const slaTimelines = sopData.slaTimelines || [];

    // Get connections and all nodes
    const connections = sopData.sop.find(item => item.section === "connections")?.data || [];
    const allNodes = sopData.sop.filter(item => item.section === "nodes");

    // Get workflow nodes (process and dispatch types, excluding delays)
    const workflowNodes = allNodes.filter(item =>
        (item.type === "process" || item.type === "dispatch") &&
        !isDelayNode(item)
    );

    // Build execution order by following connections
    const buildExecutionOrder = (): string[] => {
        const visited = new Set<string>();
        const executionOrder: string[] = [];

        // Find start node
        const startNode = allNodes.find(item => item.type === "start");
        if (!startNode) {
            // Fallback to Y position sorting if no start node
            return workflowNodes
                .sort((a, b) => (a.data?.position?.y || 0) - (b.data?.position?.y || 0))
                .map(node => node.nodeId);
        }

        const traverse = (nodeId: string) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);

            // Check if this is a workflow node we want to display
            const workflowNode = workflowNodes.find(n => n.nodeId === nodeId);
            if (workflowNode) {
                executionOrder.push(nodeId);
            }

            // Get all outgoing connections from this node
            const outgoingConnections = connections.filter((conn: any) => conn.source === nodeId);

            // Sort connections to ensure consistent ordering (optional)
            outgoingConnections.sort((a: any, b: any) => {
                // If there are labeled connections, prioritize "yes" over "no"
                if (a.label && b.label) {
                    if (a.label.toLowerCase() === "yes") return -1;
                    if (b.label.toLowerCase() === "yes") return 1;
                }
                return 0;
            });

            // Continue traversal
            outgoingConnections.forEach((conn: any) => {
                traverse(conn.target);
            });
        };

        // Start traversal from the start node
        traverse(startNode.nodeId);

        return executionOrder;
    };

    const orderedNodeIds = buildExecutionOrder();

    // Handle current stage - if it's a delay node or decision, find the related workflow node
    let effectiveCurrentNodeId = sopData.currentStage.nodeId;
    const currentNode = allNodes.find(item => item.nodeId === sopData.currentStage.nodeId);

    if (currentNode && (isDelayNode(currentNode) || currentNode.type === "decision")) {
        // If current is a delay/decision node, find the next workflow node in the flow
        const nextConnections = connections.filter((conn: any) => conn.source === sopData.currentStage.nodeId);

        for (const conn of nextConnections) {
            const nextNode = workflowNodes.find(n => n.nodeId === conn.target);
            if (nextNode) {
                effectiveCurrentNodeId = conn.target;
                break;
            }
        }
    }

    // Find current position in the ordered flow
    const currentIndex = orderedNodeIds.indexOf(effectiveCurrentNodeId);

    // Create progress steps based on the connection-ordered nodes
    return orderedNodeIds.map((nodeId, index) => {
        const node = workflowNodes.find(n => n.nodeId === nodeId);
        if (!node) return null;

        const isCompleted = currentIndex !== -1 && index < currentIndex;
        const isCurrent = index === currentIndex;

        // Find corresponding timeline data
        const statusId = node.data?.data?.config?.action;

        // Get the latest timeline entry for this status
        const latestTimelineData = slaTimelines
            .filter(timeline => timeline.statusId === statusId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        // Extract SLA from node config and convert to number
        const slaValue = node.data?.data?.config?.sla;
        const sla = slaValue ? parseInt(slaValue, 10) : undefined;

        // Use language parameter instead of hook
        const title = language === "th" 
            ? caseStatus.find((item) => statusId === item.statusId)?.th ||
              node.data?.data?.label ||
              `Step ${index + 1}`
            : caseStatus.find((item) => statusId === item.statusId)?.en ||
              node.data?.data?.label ||
              `Step ${index + 1}`;

        return {
            id: (index + 1).toString(),
            title,
            completed: isCompleted,
            current: isCurrent,
            type: node.type,
            description: node.data?.data?.description,
            sla: sla, // Added SLA value
            timeline: latestTimelineData ? {
                completedAt: new Date(latestTimelineData?.createdAt).getTime() + (7 * 60 * 60 * 1000),
                duration: latestTimelineData.duration,
                userOwner: latestTimelineData.userOwner
            } : undefined
        };
    }).filter(Boolean) as ProgressSteps[];
};


// Keep the other functions but update them to be more robust
export const mapSopToProgressStepsWithBranching = (sopData: CaseSop,language:string): ProgressSteps[] => {
    // Use the simpler ordered approach for now
    return mapSopToOrderedProgress(sopData,language);
};

export const buildProgressLanes = (sopData: CaseSop,language:string): ProgressLane[] => {
    return [{
        id: "main",
        name: "Main Flow",
        steps: mapSopToOrderedProgress(sopData,language),
        isActive: true
    }];
};

// const buildStepsForBranch = (startNodeId: string, sopData: CaseSop, connections: any[], nodes: any[]): ProgressSteps[] => {
//     return mapSopToOrderedProgress(sopData);
// };

// const isNodeInCurrentPath = (nodeId: string, currentNodeId: string, connections: any[], _nodes: any[]): boolean => {
//     return true; // Simplified for now
// };
