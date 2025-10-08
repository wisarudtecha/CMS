import { CaseSop } from "@/types/dispatch";
import { CaseStatusInterface, delayStatus } from "../ui/status/status";

export interface ProgressSteps {
    id: string;
    title: string;
    completed: boolean;
    current?: boolean;
    nextStage?:boolean;
    type?: string;
    description?: string;
    sla?: number;
    timeline?: {
        completedAt?: string;
        duration?: number;
        userOwner?: string;
    };
}

export interface ProgressStepPreviewProps {
    progressSteps: ProgressSteps[];
}
interface ProgressLane {
    id: string;
    name: string;
    steps: ProgressSteps[];
    isActive: boolean;
}

const isDelayNode = (node: any): boolean => {
    const status = node.data?.data?.config?.action || '';
    return delayStatus.includes(status);
};

export const mapSopToSimpleProgress = (sopData: CaseSop): ProgressSteps[] => {
    if (!sopData?.sop || !sopData?.currentStage) {
        return [];
    }

    const allNodes = sopData.sop.filter(item => item.section === "nodes");

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
    
    let effectiveCurrentNodeId = sopData.currentStage.nodeId;
    const currentNode = allNodes.find(item => item.nodeId === sopData.currentStage.nodeId);

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
            id: (index + 1).toString(),
            title: node.data?.data?.label || `Step ${index + 1}`,
            completed: isCompleted,
            current: isCurrent,
            type: node.type,
            description: node.data?.data?.description
        };
    });
};

export const mapSopToOrderedProgress = (sopData: CaseSop, language: string): ProgressSteps[] => {
    if (!sopData?.sop || !sopData?.currentStage) {
        return [];
    }
    const caseStatus = JSON.parse(localStorage.getItem("caseStatus") ?? "[]") as CaseStatusInterface[];
    const slaTimelines = sopData.slaTimelines || [];

    const connections = sopData.sop.find(item => item.section === "connections")?.data || [];
    const allNodes = sopData.sop.filter(item => item.section === "nodes");

    const workflowNodes = allNodes.filter(item =>
        (item.type === "process" || item.type === "dispatch") &&
        !isDelayNode(item)
    );

    const buildExecutionOrder = (): string[] => {
        const visited = new Set<string>();
        const executionOrder: string[] = [];

        const startNode = allNodes.find(item => item.type === "start");
        if (!startNode) {
            return workflowNodes
                .sort((a, b) => (a.data?.position?.y || 0) - (b.data?.position?.y || 0))
                .map(node => node.nodeId);
        }

        const traverse = (nodeId: string) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);

            const workflowNode = workflowNodes.find(n => n.nodeId === nodeId);
            if (workflowNode) {
                executionOrder.push(nodeId);
            }

            const outgoingConnections = connections.filter((conn: any) => conn.source === nodeId);

            outgoingConnections.sort((a: any, b: any) => {
                if (a.label && b.label) {
                    if (a.label.toLowerCase() === "yes") return -1;
                    if (b.label.toLowerCase() === "yes") return 1;
                }
                return 0;
            });

            outgoingConnections.forEach((conn: any) => {
                traverse(conn.target);
            });
        };

        traverse(startNode.nodeId);

        return executionOrder;
    };

    const orderedNodeIds = buildExecutionOrder();

    let effectiveCurrentNodeId = sopData.currentStage.nodeId;
    const currentNode = allNodes.find(item => item.nodeId === sopData.currentStage.nodeId);

    if (currentNode && (isDelayNode(currentNode) || currentNode.type === "decision")) {
        const nextConnections = connections.filter((conn: any) => conn.source === sopData.currentStage.nodeId);

        for (const conn of nextConnections) {
            const nextNode = workflowNodes.find(n => n.nodeId === conn.target);
            if (nextNode) {
                effectiveCurrentNodeId = conn.target;
                break;
            }
        }
    }

    const currentIndex = orderedNodeIds.indexOf(effectiveCurrentNodeId);

    return orderedNodeIds.map((nodeId, index) => {
        const node = workflowNodes.find(n => n.nodeId === nodeId);
        if (!node) return null;

        const isCompleted = currentIndex !== -1 && index < currentIndex;
        const isCurrent = index === currentIndex;
        const isNext = currentIndex !== -1 && index === currentIndex + 1;

        const statusId = node.data?.data?.config?.action;

        const latestTimelineData = slaTimelines
            .filter(timeline => timeline.statusId === statusId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        
        const slaValue = node.data?.data?.config?.sla;
        const sla = slaValue ? parseInt(slaValue, 10) : undefined;
        
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
            nextStage: isNext,
            type: node.type,
            description: node.data?.data?.description,
            sla: sla,
            timeline: latestTimelineData ? {
                completedAt: new Date(latestTimelineData?.createdAt).getTime(),
                duration: latestTimelineData.duration,
                userOwner: latestTimelineData.userOwner
            } : undefined
        };
    }).filter(Boolean) as ProgressSteps[];
};

export const mapSopToProgressStepsWithBranching = (sopData: CaseSop, language: string): ProgressSteps[] => {
    return mapSopToOrderedProgress(sopData, language);
};

export const buildProgressLanes = (sopData: CaseSop, language: string): ProgressLane[] => {
    return [{
        id: "main",
        name: "Main Flow",
        steps: mapSopToOrderedProgress(sopData, language),
        isActive: true
    }];
};

export const getTimeDifference = (fromStep: ProgressSteps, toStep: ProgressSteps): string => {
    if (!fromStep.timeline?.completedAt || !toStep.timeline?.completedAt) {
        return '';
    }
    const fromTime = new Date(fromStep.timeline.completedAt).getTime();
    const toTime = new Date(toStep.timeline.completedAt).getTime();
    const diffMs = toTime - fromTime;

    if (diffMs <= 0) return '';

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    const years = diffYears;
    const months = diffMonths % 12;
    const days = diffDays % 30;
    const hours = diffHours % 24;
    const minutes = diffMinutes % 60;
    const seconds = diffSeconds % 60;

    const timeUnits = [];

    if (years > 0) timeUnits.push(`${years}y`);
    if (months > 0) timeUnits.push(`${months}mo`);
    if (days > 0) timeUnits.push(`${days}d`);
    if (hours > 0) timeUnits.push(`${hours}h`);
    if (minutes > 0) timeUnits.push(`${minutes}m`);
    if (seconds > 0) timeUnits.push(`${seconds}s`);

    return timeUnits.slice(0, 2).join(' ') || '0s';
};

export const isSlaViolated = (step: ProgressSteps): boolean => {
    if (!step.sla || !step.timeline?.duration) {
        return false;
    }

    const slaInSeconds = step.sla * 60;
    return step.timeline.duration > slaInSeconds;
};
