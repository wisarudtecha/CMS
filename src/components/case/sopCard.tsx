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

interface CaseCardProps {
    onAddSubCase?: () => void;
    onAssignClick?: () => void;
    onEditClick?: () => void;
    setCaseData?: React.Dispatch<React.SetStateAction<CaseDetails | undefined>>;
    caseData: CaseSop;
    editFormData: boolean;
    comment?: CaseHistory[];
    showCommentButton?:boolean;
    showAttachButton?:boolean;
}

export const CaseCard: React.FC<CaseCardProps> = ({ 
    onAddSubCase, 
    onAssignClick, 
    onEditClick, 
    caseData, 
    editFormData, 
    setCaseData, 
    comment,
    showCommentButton=true,
    showAttachButton=true
}) => {
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
    
    // Use the simpler ordered progress approach
    const progressSteps = useMemo(() => {
        return mapSopToOrderedProgress(caseData);
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
                    {showCommentButton&&<Button onClick={handleCommentToggle} size="sm" variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                        {showComment ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Comment
                    </Button>}

                    {onEditClick&&<Button onClick={onEditClick} size="sm" variant="outline" className="border-blue-500 dark:border-blue-600 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900">
                        {editFormData ? "Cancel Edit" : "Edit"}
                    </Button>}

                    {showAttachButton&&<div>
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
                    </div>}

                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 gap-2">
                    {onAddSubCase &&
                        <Button onClick={onAddSubCase} size="sm" className=" text-white  ">
                            <span>Add WO</span>
                        </Button>}
                    {onAssignClick&&<Button onClick={onAssignClick} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1">
                        <User_Icon className="w-4 h-4" />
                        <span>Assign Officer</span>
                    </Button>}
                </div>
            </div>
            {showComment && <Comments caseId={caseData.caseId} comment={comment} />}
        </div>
    );
};