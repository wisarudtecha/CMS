// sopCard.tsx

import { CaseSop } from "@/store/api/dispatch";
import Button from "../ui/button/Button";
import {
    Clock,
    User as User_Icon,
    MessageSquare,
    Paperclip,
    ChevronDown,
    ChevronUp,
} from "lucide-react"

import { useMemo, useRef, useState } from "react";
import { mergeCaseTypeAndSubType } from "../caseTypeSubType/mergeCaseTypeAndSubType";
import Badge from "../ui/badge/Badge";
import { findCaseTypeSubTypeByTypeIdSubTypeId } from "../caseTypeSubType/findCaseTypeSubTypeByMergeName";
import { Comments } from "../comment/Comment";
import DateStringToDateFormat from "../date/DateToString";
import { getPriorityBorderColorClass, getTextPriority } from "../function/Prioriy";
import { CaseTypeSubType } from "../interface/CaseType";
import ProgressStepPreview from "../progress/ProgressBar";
import { statusIdToStatusTitle } from "../ui/status/status";
import { CaseHistory } from "@/store/api/caseApi";
import { CaseDetails } from "@/types/case";

interface ProgressSteps {
    id: number;
    title: string;
    completed: boolean;
    current?: boolean;
    type?: string;
    description?: string;
}

// interface ProgressStepPrevieProps {
//     progressSteps: ProgressSteps[];
//     className?: string;
// }

interface ProgressLane {
    id: string;
    name: string;
    steps: ProgressSteps[];
    isActive: boolean;
}

// interface ProgressNode {
//     id: string;
//     title: string;
//     type: string;
//     completed: boolean;
//     current?: boolean;
//     branches?: ProgressNode[];
// }


const mapSopToProgressSteps = (sopData: CaseSop): Array<{
    id: string;
    title: string;
    completed: boolean;
    current?: boolean;
    description?: string;
    type?: string;
}> => {
    if (!sopData?.sop || !sopData?.currentStage) {
        return [];
    }

    // Get workflow connections to understand the flow order
    const connections = sopData.sop.find(item => item.section === "connections")?.data || [];

    // Extract nodes and build a flow map
    const nodes = sopData.sop.filter(item =>
        item.section === "nodes" &&
        item.type !== "start" &&
        item.type !== "end"
    );

    // Build execution order based on connections starting from start node
    const buildExecutionOrder = () => {
        const orderMap: string[] = [];
        const visited = new Set<string>();

        // Find start node
        const startNode = sopData.sop.find(item => item.type === "start");
        if (!startNode) return nodes.map(n => n.nodeId);

        const traverse = (nodeId: string) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);

            const node = nodes.find(n => n.nodeId === nodeId);
            if (node) {
                orderMap.push(nodeId);
            }

            // Find next nodes from connections
            const nextConnections = connections.filter((conn: any) => conn.source === nodeId);
            nextConnections.forEach((conn: any) => {
                traverse(conn.target);
            });
        };

        // Start traversal from start node's targets
        const startConnections = connections.filter((conn: any) => conn.source === startNode.nodeId);
        startConnections.forEach((conn: any) => {
            traverse(conn.target);
        });

        return orderMap;
    };

    const executionOrder = buildExecutionOrder();
    const currentNodeId = sopData.currentStage.nodeId;
    const currentIndex = executionOrder.indexOf(currentNodeId);

    return executionOrder.map((nodeId, index) => {
        const node = nodes.find(n => n.nodeId === nodeId);
        if (!node) return null;

        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return {
            id: node.nodeId,
            title: node.data?.data?.label || `Step ${index + 1}`,
            description: node.data?.data?.description,
            completed: isCompleted,
            current: isCurrent,
            type: node.type,
        };
    }).filter(Boolean) as Array<{
        id: string;
        title: string;
        completed: boolean;
        current?: boolean;
        description?: string;
        type?: string;
    }>;
};

export const mapSopToSimpleProgress = (sopData: CaseSop): ProgressSteps[] => {
    if (!sopData?.sop || !sopData?.currentStage) {
        return [];
    }

    // Get only process nodes (skip decisions for simplicity)
    const processNodes = sopData.sop
        .filter(item =>
            item.section === "nodes" &&
            item.type === "process" // Only show process steps
        )
        .sort((a, b) => {
            const aY = a.data?.position?.y || 0;
            const bY = b.data?.position?.y || 0;
            return aY - bY;
        });

    const currentNodeId = sopData.currentStage.nodeId;
    const isCurrentDecision = sopData.currentStage.type === "decision";

    // If current stage is a decision, find the next process step
    let currentProcessNode = currentNodeId;
    if (isCurrentDecision) {
        // For decisions, show the decision as current for now
        // You can enhance this to show next process step
        const connections = sopData.sop.find(item => item.section === "connections")?.data || [];
        const nextConnections = connections.filter((conn: any) => conn.source === currentNodeId);

        if (nextConnections.length > 0) {
            // For simplicity, take the first connection

            const nextNodeId = nextConnections[0].target;
            const nextNode = processNodes.find(n => n.nodeId === nextNodeId);
            if (nextNode) {
                currentProcessNode = nextNodeId;
            }
        }
    }

    let foundCurrent = false;

    return processNodes.map((node, index) => {
        const isCompleted = !foundCurrent && node.nodeId !== currentProcessNode;
        const isCurrent = node.nodeId === currentProcessNode;

        if (isCurrent) {
            foundCurrent = true;
        }

        return {
            id: index + 1,
            title: node.data?.data?.label || `Step ${index + 1}`,
            completed: isCompleted,
            current: isCurrent,
            type: node.type,
            description: node.data?.data?.description
        };
    });
};

// Advanced progress mapper with branching support
export const mapSopToProgressStepsWithBranching = (sopData: CaseSop): ProgressSteps[] => {
    if (!sopData?.sop || !sopData?.currentStage) {
        return [];
    }

    // Get connections to understand the flow
    const connections = sopData.sop.find(item => item.section === "connections")?.data || [];
    const nodes = sopData.sop.filter(item =>
        item.section === "nodes" &&
        item.type !== "start" &&
        item.type !== "end"
    );

    // Build the current execution path only
    const buildCurrentPath = (currentNodeId: string): string[] => {
        const visited = new Set<string>();

        // Find start node
        const startNode = sopData.sop.find(item => item.type === "start");
        if (!startNode) return [];

        // Trace forward from start to current
        const traceToTarget = (nodeId: string, targetId: string, currentPath: string[]): string[] | null => {
            if (visited.has(nodeId)) return null;
            visited.add(nodeId);

            const newPath = [...currentPath, nodeId];

            if (nodeId === targetId) {
                return newPath;
            }

            const nextConnections = connections.filter((conn: any) => conn.source === nodeId);
            for (const conn of nextConnections) {
                const result = traceToTarget(conn.target, targetId, newPath);
                if (result) {
                    return result;
                }
            }

            return null;
        };

        // Start from start node's connections
        const startConnections = connections.filter((conn: any) => conn.source === startNode.nodeId);
        for (const conn of startConnections) {
            const result = traceToTarget(conn.target, currentNodeId, []);
            if (result) {
                return result;
            }
        }

        return [];
    };

    const currentPath = buildCurrentPath(sopData.currentStage.nodeId);
    const currentNodeId = sopData.currentStage.nodeId;
    const currentIndex = currentPath.indexOf(currentNodeId);

    return currentPath.map((nodeId, index) => {
        const node = nodes.find(n => n.nodeId === nodeId);
        if (!node) return null;

        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        // Special handling for decision nodes
        let title = node.data?.data?.label || `Step ${index + 1}`;
        if (node.type === "decision") {
            title = `Decision: ${title}`;
        }

        return {
            id: index + 1,
            title,
            completed: isCompleted,
            current: isCurrent,
            type: node.type,
            description: node.data?.data?.description
        };
    }).filter(Boolean) as ProgressSteps[];
};

// Multi-lane progress for complex workflows
export const buildProgressLanes = (sopData: CaseSop): ProgressLane[] => {
    const connections = sopData.sop.find(item => item.section === "connections")?.data || [];
    const nodes = sopData.sop.filter(item =>
        item.section === "nodes" &&
        item.type !== "start" &&
        item.type !== "end"
    );

    // Find decision nodes
    const decisionNodes = nodes.filter(n => n.type === "decision");
    if (decisionNodes.length === 0) {
        // No decisions, use simple linear progress
        return [{
            id: "main",
            name: "Main Flow",
            steps: mapSopToSimpleProgress(sopData),
            isActive: true
        }];
    }

    // Build separate lanes for each decision branch
    const lanes: ProgressLane[] = [];

    decisionNodes.forEach(decisionNode => {
        const branches = connections.filter((conn: any) => conn.source === decisionNode.nodeId);

        branches.forEach((branch: any, index: number) => {
            const laneName = branch.label || `Option ${index + 1}`;
            const isActiveLane = isNodeInCurrentPath(branch.target, sopData.currentStage.nodeId, connections, nodes);

            lanes.push({
                id: `${decisionNode.nodeId}-${index}`,
                name: laneName,
                steps: buildStepsForBranch(branch.target, sopData, connections, nodes),
                isActive: isActiveLane
            });
        });
    });

    return lanes;
};

// Helper function to check if a node is in the current execution path
const isNodeInCurrentPath = (nodeId: string, currentNodeId: string, connections: any[], _nodes: any[]): boolean => {
    const visited = new Set<string>();

    const canReach = (fromId: string, toId: string): boolean => {
        if (fromId === toId) return true;
        if (visited.has(fromId)) return false;
        visited.add(fromId);

        const nextConnections = connections.filter((conn: any) => conn.source === fromId);
        return nextConnections.some((conn: any) => canReach(conn.target, toId));
    };

    return canReach(nodeId, currentNodeId);
};

// Build progress steps for a specific branch
const buildStepsForBranch = (startNodeId: string, sopData: CaseSop, connections: any[], nodes: any[]): ProgressSteps[] => {
    const branchNodes: string[] = [];
    const visited = new Set<string>();

    const traverse = (nodeId: string) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);

        const node = nodes.find((n: any) => n.nodeId === nodeId);
        if (node) {
            branchNodes.push(nodeId);
        }

        const nextConnections = connections.filter((conn: any) => conn.source === nodeId);
        nextConnections.forEach((conn: any) => {
            traverse(conn.target);
        });
    };

    traverse(startNodeId);

    const currentNodeId = sopData.currentStage.nodeId;
    const currentIndex = branchNodes.indexOf(currentNodeId);

    return branchNodes.map((nodeId, index) => {
        const node = nodes.find((n: any) => n.nodeId === nodeId);
        if (!node) return null;

        const isCompleted = currentIndex !== -1 && index < currentIndex;
        const isCurrent = index === currentIndex;

        return {
            id: index + 1,
            title: node.data?.data?.label || `Step ${index + 1}`,
            completed: isCompleted,
            current: isCurrent,
            type: node.type,
            description: node.data?.data?.description
        };
    }).filter(Boolean) as ProgressSteps[];
};

interface CaseCardProps {
    onAddSubCase?: () => void;
    onAssignClick: () => void;
    onEditClick: () => void;
    setCaseData?: React.Dispatch<React.SetStateAction<CaseDetails | undefined>>;
    caseData: CaseSop;
    editFormData: boolean;
    comment?: CaseHistory[];
}

export const CaseCard: React.FC<CaseCardProps> = ({ onAddSubCase, onAssignClick, onEditClick, caseData, editFormData, setCaseData, comment }) => {
    const [showComment, setShowComment] = useState<boolean>(false);
    const caseTypeSupTypeData = useMemo(() =>
        JSON.parse(localStorage.getItem("caseTypeSubType") ?? "[]") as CaseTypeSubType[], []
    );

    const handleCommentToggle = () => {
        setShowComment(!showComment);
    };

    // Fallback to static steps if no SOP data
    const defaultProgressSteps = [
        { id: "1", title: "Received", completed: true },
        { id: "2", title: "Assigned", completed: true },
        { id: "3", title: "Acknowledged", completed: false, current: true },
        { id: "4", title: "En Route", completed: false },
        { id: "5", title: "On Site", completed: false },
        { id: "6", title: "Completed", completed: false }
    ];
    const progressSteps = useMemo(() => {
        return mapSopToProgressSteps(caseData);
    }, [caseData]);

    // Use dynamic steps if available, otherwise use default
    const stepsToDisplay = progressSteps.length > 0 ? progressSteps : defaultProgressSteps;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            const newFilesArray = Array.from(files);

            setCaseData?.((prev) => {
                if (!prev) return prev;

                const currentFiles = prev.attachFileResult ?? [];

                return {
                    ...prev,
                    attachFileResult: [...currentFiles, ...newFilesArray],
                };
            });
            e.target.value = '';
        }
    };

    return (
        <div className={`mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 ${getPriorityBorderColorClass(caseData.priority)}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{
                        mergeCaseTypeAndSubType(
                            findCaseTypeSubTypeByTypeIdSubTypeId(
                                caseTypeSupTypeData,
                                caseData?.caseTypeId || "",
                                caseData?.caseSTypeId || ""
                            ) ?? ({} as CaseTypeSubType)
                        )
                    }</h2>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Create Date: {DateStringToDateFormat(caseData.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <User_Icon className="w-4 h-4" />
                            <span>Created: {caseData.createdBy}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2 text-center mt-3 sm:mt-0">
                    <Badge variant="outline" color={`${getTextPriority(caseData.priority).color}`}>
                        {getTextPriority(caseData.priority).level} Priority
                    </Badge>
                    <Badge variant="outline">
                        {statusIdToStatusTitle(caseData.statusId)}
                    </Badge>
                </div>
            </div>

            <ProgressStepPreview progressSteps={stepsToDisplay} />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleCommentToggle} size="sm" variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                        {showComment ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Comment
                    </Button>
                    {/* Show Attach File button only in edit mode for existing cases */}

                    <Button onClick={onEditClick} size="sm" variant="outline" className="border-blue-500 dark:border-blue-600 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900">
                        {editFormData ? "Cancel Edit" : "Edit"}
                    </Button>


                    <div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                            onClick={handleButtonClick}
                        >
                            <Paperclip className="w-4 h-4 mr-2" />
                            Attach File
                        </Button>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            multiple
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                    </div>

                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 gap-2">
                    {onAddSubCase &&
                        <Button onClick={onAddSubCase} size="sm" className=" text-white  ">
                            <span>Add WO</span>
                        </Button>}
                    <Button onClick={onAssignClick} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1">
                        <User_Icon className="w-4 h-4" />
                        <span>Assign Officer</span>
                    </Button>
                </div>
            </div>
            {showComment && <Comments caseId={caseData.caseId} comment={comment} />}
        </div>
    );
};


