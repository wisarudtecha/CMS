// /src/components/workflow/editor/Editor.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AngleLeftIcon, AngleRightIcon, BoxCubeIcon, CheckLineIcon, CloseIcon, CopyIcon, DownloadIcon, FileIcon, PencilIcon, TrashBinIcon } from "@/icons";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { ToastContainer } from "@/components/crud/ToastContainer";
import { FormField } from "@/components/interface/FormField";
import { Modal } from "@/components/ui/modal";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/hooks/useTranslation";
import { useCreateWorkflowMutation, useUpdateWorkflowMutation } from "@/store/api/workflowApi";
import type { Connection, ConnectionType, NodeType, Position, WorkflowData, WorkflowEditorComponentProps, WorkflowNode } from "@/types/workflow";
import CustomizableSelect from "@/components/form/CustomizableSelect";
import DynamicForm from "@/components/form/dynamic-form/DynamicForm";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";

// Grid configuration
const GRID_SIZE = 20 as const;
const NODE_WIDTH = 96 as const; // 24 * 4 (w-24)
const NODE_HEIGHT = 64 as const; // 16 * 4 (h-16)

const WorkflowEditorComponent: React.FC<WorkflowEditorComponentProps> = ({
  caseStatuses,
  forms,
  userGroup,
  users,
  workflowAction,
  workflowData,
  workflowId,
  initialData = {
    nodes: [],
    connections: [],
    metadata: {
      title: "Untitled Workflow",
      description: "",
      status: "draft",
      totalSla: 0,
      createdAt: new Date().toISOString()
    }
  },
  onSave
}) => {
  // ===================================================================
  // Hooks
  // ===================================================================

  const permissions = usePermissions();
  const { toasts, addToast, removeToast } = useToast();
  const { language, t } = useTranslation();

  // Node type configurations
  const nodeTypes = {
    start: {
      button: "bg-success-500 text-white dark:text-white hover:bg-success-600",
      color: "bg-success-500 dark:bg-success-400",
      label: t("crud.workflow.builder.toolbar.nodes.start")
    },
    process: {
      button: "bg-brand-500 text-white dark:text-white hover:bg-brand-600",
      color: "bg-brand-500 dark:bg-brand-400",
      label: t("crud.workflow.builder.toolbar.nodes.process")
    },
    dispatch: {
      button: "bg-gray-500 text-white dark:text-white hover:bg-gray-600",
      color: "bg-gray-500 dark:bg-gray-400",
      label: t("crud.workflow.builder.toolbar.nodes.dispatch")
    },
    sla: {
      button: "bg-purple-500 text-white dark:text-white hover:bg-purple-600",
      color: "bg-purple-500 dark:bg-purple-400",
      label: t("crud.workflow.builder.toolbar.nodes.sla")
    },
    decision: {
      button: "bg-warning-500 text-white dark:text-white hover:bg-warning-600",
      color: "bg-warning-500 dark:bg-warning-400",
      label: t("crud.workflow.builder.toolbar.nodes.decision")
    },
    end: {
      button: "bg-error-500 text-white dark:text-white hover:bg-error-600",
      color: "bg-error-500 dark:bg-error-400",
      label: t("crud.workflow.builder.toolbar.nodes.end")
    }
  } as const;

  // Workflow status options
  const workflowStatuses = [
    { value: "draft", label: t("crud.workflow.builder.metadata.status.options.draft"), color: "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800" },
    { value: "active", label: t("crud.workflow.builder.metadata.status.options.active"), color: "text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-800" },
    { value: "inactive", label: t("crud.workflow.builder.metadata.status.options.inactive"), color: "text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-800" },
    { value: "testing", label: t("crud.workflow.builder.metadata.status.options.testing"), color: "text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800" }
  ] as const;

  // ===================================================================
  // API Mutations
  // ===================================================================

  const [createWorkflow] = useCreateWorkflowMutation();
  const [updateWorkflow] = useUpdateWorkflowMutation();

  // ===================================================================
  // Component State
  // ===================================================================

  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ===================================================================
  // State Variables
  // ===================================================================

  const [connectingFrom, setConnectingFrom] = useState<"yes" | "no" | null>(null);
  const [connections, setConnections] = useState<Connection[]>(initialData?.connections || []);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [draggedNodeType, setDraggedNodeType] = useState<WorkflowNode["type"] | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [importJsonText, setImportJsonText] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialData?.nodes || []);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [showComponentsPreview, setShowComponentsPreview] = useState<boolean>(false);
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false);
  const [showJsonPreview, setShowJsonPreview] = useState<boolean>(false);
  const [tempConnection, setTempConnection] = useState<Position | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [workflowMetadata, setWorkflowMetadata] = useState(initialData?.metadata || []);
  // Enhanced state for Components Preview
  const [decisionSelections, setDecisionSelections] = useState<Record<string, "yes" | "no">>({});
  const [loading, setLoading] = useState(false);
  
  // ===================================================================
  // Derived State
  // ===================================================================

  // Determine if the workflow is editable
  const editable = workflowId === "new" || (workflowId !== "new" && workflowAction === "edit");

  const decisionLang: Record<string, string> = {
    yes: language === "th" && "ใช่" || "Yes", no: language === "th" && "ไม่" || "No"
  };

  // ===================================================================
  // Helper Functions
  // ===================================================================
  
  // Prepare case status options for Select component
  const caseStatusOptions = useMemo(() => (
    Array?.isArray(caseStatuses)
      ? caseStatuses?.map(caseStatus => ({
          value: caseStatus?.statusId || "",
          label: language === "th" && caseStatus?.th || caseStatus?.en || ""
        }))
      : []
  ), [caseStatuses, language]);

  // Prepare form options for Select component
  const formOptions = Array?.isArray(forms) && forms?.map(form => {
    return { value: form?.formId || "", label: form?.formName || "" };
  }) || [];

  // Prepare user options for Select component
  const userOptions = Array?.isArray(users) && users?.map(user => {
    return { value: user?.username || "", label: user?.displayName || user?.username || "" };
  }) || [];

  // Prepare group options for Select component
  const groupOptions = Array?.isArray(userGroup) && userGroup?.map(ug => {
    return { value: ug?.grpId || "", label: language === "th" && ug?.th || ug?.en || "" };
  }) || [];

  // Prepare workflow status options for Select component
  const workflowStatusesOptions = Array?.isArray(workflowStatuses) && workflowStatuses?.map(status => ({
    value: status?.value,
    label: status?.label
  })) || [];

  const countSLA = useCallback(() => {
    return nodes?.reduce((total, node) => {
      const config = node.data.config;
      const slaValue = (config?.SLA ?? config?.sla) || undefined;
      if (slaValue !== undefined && !isNaN(Number(slaValue))) {
        return total + Number(slaValue);
      }
      return total;
    }, 0);
  }, [nodes]);

  // Update workflow metadata
  const updateWorkflowMetadata = useCallback((updates: Partial<typeof workflowMetadata>) => {
    setWorkflowMetadata(prev => ({ ...prev, ...updates }));
  }, []);

  // Load workflow data from URL if workflowId is provided
  useEffect(() => {
    if (workflowId && workflowId !== "new") {
      const loadWorkflowFromUrl = async () => {
        try {
          const { nodes, connections, metadata } = workflowData as {
            nodes: NodeType[];
            connections: ConnectionType[];
            metadata: {
              title: string;
              description: string;
              status: string;
              createdAt: string;
            };
          };
          
          setNodes(
            nodes?.map(n => ({
              ...n,
              type: n?.type as WorkflowNode["type"],
            })) || null
          );

          setConnections(connections);

          if (metadata) {
            setWorkflowMetadata({
              ...metadata,
              status: metadata?.status as WorkflowData["metadata"]["status"],
            });
          }
        }
        catch (error) {
          console.error("Failed to load workflow:", error);
        }
      };
      
      if (workflowData) {
        loadWorkflowFromUrl();
      }
    }
  }, [workflowData, workflowId]);

  useEffect(() => {
    updateWorkflowMetadata({ totalSla: countSLA() });
  }, [countSLA, updateWorkflowMetadata]);

  const findNodeByAction = useCallback((action: string, type?: string): WorkflowNode | undefined => {
    if (type === "dispatch") {
      return nodes.find(node => node?.data?.config?.action === action && node?.type === type);
    }
    return nodes.find(node => node?.data?.config?.action === action);
  }, [nodes]);

  // Validate workflow before saving
  const validateWorkflow = useCallback((): string[] => {
    const errors: string[] = [];

    ["start", "dispatch", "end"]?.map(n => {
      if (!nodes?.some(node => node?.type === n)) {
        let nodeName = "";
        if (n === "start") {
          nodeName = t("crud.workflow.builder.toolbar.nodes.start");
        }
        else if (n === "dispatch") {
          nodeName = t("crud.workflow.builder.toolbar.nodes.dispatch");
        }
        else if (n === "end") {
          nodeName = t("crud.workflow.builder.toolbar.nodes.end");
        }
        errors?.push(t("crud.workflow.builder.node.validation.node_required").replace("_NODE_", nodeName));
      }
    });

    ["S001", "S003", "S007"]?.map(a => {
      const actionValue = caseStatusOptions?.find(s => s?.value === a);
      const actionLabel = actionValue?.label?.toLowerCase() || "";
      // const isDispatch = actionValue?.label?.toLowerCase()?.replace("ed", "") || "";
      const isDispatch = actionValue?.value === "S003" && "dispatch" || ""
      if (isDispatch === "dispatch") {
        if (!findNodeByAction(actionValue?.value || "", isDispatch || "")) {
          errors?.push(t("crud.workflow.builder.node.validation.action_required")
            .replace("_ACTION_", actionLabel)
            .replace("_NODE_", t("crud.workflow.builder.toolbar.nodes.dispatch"))
          );
        }
      }
      else {
        if (!findNodeByAction(actionValue?.value || "")) {
          errors?.push(t("crud.workflow.builder.node.validation.action_required")
            .replace("_ACTION_", actionLabel)
            .replace("_NODE_", t("crud.workflow.builder.toolbar.nodes.process"))
          );
        }
      }
    });
    
    // const hasStartNode = nodes?.some(node => node?.type === "start");
    // const hasEndNode = nodes?.some(node => node?.type === "end");
    
    // if (!hasStartNode) {
    //   errors?.push("Workflow must have at least one Start node");
    // }
    
    // if (!hasEndNode) {
    //   errors?.push("Workflow must have at least one End node");
    // }
    
    // Validate connection limits
    const connectionCounts = nodes?.reduce((acc, node) => {
      const outgoingConnections = connections?.filter(conn => conn?.source === node?.id);
      acc[node?.id] = outgoingConnections?.length;
      return acc;
    }, {} as Record<string, number>);
    
    nodes?.forEach(node => {
      const count = connectionCounts[node?.id] || 0;
      if ((node?.type === "start" || node?.type === "process" || node?.type === "dispatch" || node?.type === "end") && count > 1) {
        errors?.push(`${node?.data?.label} can only have 1 outgoing connection`);
      }
      if ((node?.type === "decision" || node?.type === "sla") && count > 2) {
        errors?.push(`${node?.data?.label} can only have 2 outgoing connections (Yes/No)`);
      }
    });
    
    return errors;
  }, [caseStatusOptions, connections, nodes, findNodeByAction, t]);

  // Snap position to grid
  const snapToGrid = useCallback((position: Position): Position => {
    return {
      x: Math?.round(position?.x / GRID_SIZE) * GRID_SIZE,
      y: Math?.round(position?.y / GRID_SIZE) * GRID_SIZE
    };
  }, []);

  // Calculate connection point on node border
  const getNodeConnectionPoint = useCallback((fromPos: Position, toPos: Position, isSource: boolean): Position => {
    const nodeCenter = {
      x: (isSource ? fromPos?.x : toPos?.x) + NODE_WIDTH / 2,
      y: (isSource ? fromPos?.y : toPos?.y) + NODE_HEIGHT / 2
    };
    
    const otherCenter = {
      x: (isSource ? toPos?.x : fromPos?.x) + NODE_WIDTH / 2,
      y: (isSource ? toPos?.y : fromPos?.y) + NODE_HEIGHT / 2
    };

    // Calculate which side to connect from/to
    const dx = otherCenter?.x - nodeCenter?.x;
    const dy = otherCenter?.y - nodeCenter?.y;
    
    const nodeHalfWidth = NODE_WIDTH / 2;
    const nodeHalfHeight = NODE_HEIGHT / 2;
    
    // Determine connection side based on direction
    if (Math?.abs(dx) > Math?.abs(dy)) {
      // Horizontal connection (left/right)
      return {
        x: nodeCenter?.x + (dx > 0 ? nodeHalfWidth : -nodeHalfWidth),
        y: nodeCenter?.y
      };
    }
    else {
      // Vertical connection (top/bottom)
      return {
        x: nodeCenter?.x,
        y: nodeCenter?.y + (dy > 0 ? nodeHalfHeight : -nodeHalfHeight)
      };
    }
  }, []);

  // Enhanced path traversal for Components Preview
  const getWorkflowPath = useCallback((startNodeId: string, decisions: Record<string, "yes" | "no">): string[] => {
    const path: string[] = [];
    const visited = new Set<string>();
    
    const traverse = (nodeId: string) => {
      if (visited?.has(nodeId)) {
        return;
      }
      visited?.add(nodeId);
      
      const node = nodes?.find(n => n?.id === nodeId);
      if (!node) {
        return;
      }
      
      path?.push(nodeId);
      
      if (node?.type === "end") {
        return;
      }
      
      const outgoingConnections = connections?.filter(c => c?.source === nodeId);
      
      if (node?.type === "decision" || node?.type === "sla") {
        const selectedPath = decisions[nodeId] || "yes"; // Default to yes
        const connection = outgoingConnections?.find(c => c?.label === selectedPath);
        if (connection) {
          traverse(connection?.target);
        }
      }
      else {
        // For non-decision nodes, follow the first connection
        if (outgoingConnections?.length > 0) {
          traverse(outgoingConnections[0]?.target);
        }
      }
    };
    
    traverse(startNodeId);
    return path;
  }, [nodes, connections]);

  // Generate components preview based on workflow path
  const generateComponentsPreview = useCallback(() => {
    const startNodes = nodes?.filter(n => n?.type === "start");
    if (startNodes?.length === 0) {
      return [];
    }

    const pathNodes = getWorkflowPath(startNodes[0]?.id, decisionSelections);

    type PreviewComponent =
      {
        type: "start";
        id: string;
        label: string;
        description?: string;
        continueFromWorkflow?: boolean;
        sourceWorkflowId?: string;
      } |
      {
        type: "process";
        id: string;
        label: string;
        form?: FormField;
        action?: string;
        sla?: string | number;
        group?: string;
        pic?: string;
      } |
      {
        type: "dispatch";
        id: string;
        label: string;
        form?: FormField;
        action?: string;
        sla?: string | number;
        group?: string;
        pic?: string;
      } |
      {
        type: "sla";
        id: string;
        label: string;
        SLA?: string | number;
      } |
      {
        type: "decision";
        id: string;
        label: string;
        condition?: string;
      } |
      {
        type: "end";
        id: string;
        label: string;
        description?: string;
        allowContinuation?: boolean;
        nextWorkflowId?: string;
      };

    const components: PreviewComponent[] = [];

    pathNodes?.forEach(nodeId => {
      const node = nodes?.find(n => n?.id === nodeId);
      if (!node) {
        return;
      }

      if (node?.type === "start") {
        components?.push({
          type: "start",
          id: node?.id,
          label: node?.data?.label,
          description: node?.data?.description,
          continueFromWorkflow: node?.data?.config?.continueFromWorkflow === true,
          sourceWorkflowId: typeof node?.data?.config?.sourceWorkflowId === "string" ? node?.data?.config?.sourceWorkflowId : undefined
        });
      }
      else if (node?.type === "process" || node?.type === "dispatch") {
        components?.push({
          type: node?.type === "dispatch" ? "dispatch" : "process",
          id: node?.id,
          label: node?.data?.label,
          form: forms?.find(f => f?.formId === node?.data?.config?.formId),
          sla: typeof node?.data?.config?.sla === "string" || typeof node?.data?.config?.sla === "number" ? node?.data?.config?.sla : undefined,
          action: language === "th" && (
            caseStatuses?.find(a => a?.statusId === node?.data?.config?.action)?.th || caseStatuses?.find(a => a?.statusId === node?.data?.config?.action)?.en
          ) || "",
          group: Array?.isArray(node?.data?.config?.group)
            ? node?.data?.config?.group?.map((gid: string) => language === "th" && (
              userGroup?.find(ug => ug?.grpId === gid)?.th || userGroup?.find(ug => ug?.grpId === gid)?.en
            ) || gid)?.join(", ")
            : (typeof node?.data?.config?.group === "string"
              ? language === "th" && (
                userGroup?.find(ug => ug?.grpId === node?.data?.config?.group)?.th || userGroup?.find(ug => ug?.grpId === node?.data?.config?.group)?.en
              ) ||
                node?.data?.config?.group
              : undefined),
          pic: Array?.isArray(node?.data?.config?.pic)
            ? node?.data?.config?.pic?.map((pid: string) => users?.find(u => u?.id === pid)?.displayName || users?.find(u => u?.id === pid)?.username || pid)?.join(", ")
            : (typeof node?.data?.config?.pic === "string"
              ? users?.find(u => u?.id === node?.data?.config?.pic)?.displayName || 
                users?.find(u => u?.id === node?.data?.config?.pic)?.username || 
                node.data?.config?.pic
              : undefined),
        });
      }
      else if (node?.type === "sla") {
        components?.push({
          type: "sla",
          id: node?.id,
          label: node?.data?.label,
          SLA: typeof node?.data?.config?.SLA === "string" || typeof node?.data?.config?.SLA === "number" ? node?.data?.config?.SLA : undefined
        });
      }
      else if (node?.type === "decision") {
        components?.push({
          type: "decision",
          id: node?.id,
          label: node?.data?.label,
          condition: typeof node?.data?.config?.condition === "string" ? node?.data?.config?.condition : undefined
        });
      }
      else if (node?.type === "end") {
        components?.push({
          type: "end",
          id: node?.id,
          label: node?.data?.label,
          description: node?.data?.description,
          allowContinuation: node?.data?.config?.allowContinuation === true,
          nextWorkflowId: typeof node?.data?.config?.nextWorkflowId === "string" ? node?.data?.config?.nextWorkflowId : undefined
        });
      }
    });
    
    return components;
  }, [
    caseStatuses,
    forms,
    nodes,
    decisionSelections,
    language,
    userGroup,
    users,
    getWorkflowPath
  ]);

  // Handle decision toggle in Components Preview
  const handleDecisionToggle = useCallback((nodeId: string, decision: "yes" | "no") => {
    setDecisionSelections(prev => ({
      ...prev,
      [nodeId]: decision
    }));
  }, []);

  // Add new node with dynamic grid positioning
  const addNode = useCallback((type: WorkflowNode["type"], position?: Position) => {
    // Calculate dynamic grid position if not provided
    let nodePosition = position;
    if (!nodePosition) {
      // Get the current scroll position of the canvas
      const canvasElement = canvasRef.current;
      const scrollLeft = canvasElement?.scrollLeft || 0;
      const scrollTop = canvasElement?.scrollTop || 0;
      
      // Position new nodes at top-left of visible canvas area with some padding
      const baseX = scrollLeft + GRID_SIZE * 2; // 2 grid units from left edge
      const baseY = scrollTop + GRID_SIZE * 4; // 4 grid units from top edge

      // Find next available grid position
      const existingPositions = nodes.map(n => n?.position);

      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 8; col++) {
          const testPosition = {
            x: baseX + col * (NODE_WIDTH + GRID_SIZE),
            y: baseY + row * (NODE_HEIGHT + GRID_SIZE)
          };
          
          const isOccupied = existingPositions?.some(pos => 
            Math?.abs(pos?.x - testPosition?.x) < NODE_WIDTH && 
            Math?.abs(pos?.y - testPosition?.y) < NODE_HEIGHT
          );
          
          if (!isOccupied) {
            nodePosition = snapToGrid(testPosition);
            break;
          }
        }
        if (nodePosition) break;
      }
      
      // Fallback position if no free spot found
      if (!nodePosition) {
        nodePosition = snapToGrid({ x: baseX, y: baseY });
      }
    }

    // Initialize config based on node type
    let initialConfig = {};
    if (type === "start") {
      initialConfig = {
        continueFromWorkflow: false,
        sourceWorkflowId: ""
      };
    }
    else if (type === "end") {
      initialConfig = {
        allowContinuation: false,
        nextWorkflowId: ""
      };
    }
    // SLA nodes now get the same initial config as decision nodes
    else if (type === "decision") {
      initialConfig = {
        condition: ""
      };
    }

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      position: nodePosition,
      data: {
        label: `${nodeTypes[type]?.label} ${nodes?.filter(n => n?.type === type)?.length + 1}`,
        description: "",
        config: initialConfig
      }
    };
    
    setNodes(prev => [...prev, newNode]);
    // Automatically select the newly added node
    setSelectedNode(newNode);
    
    return newNode;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, snapToGrid]);

  // Handle drag start from node palette
  const handleDragStart = useCallback((e: React.DragEvent, nodeType: WorkflowNode["type"]) => {
    setDraggedNodeType(nodeType);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer?.setData("text/plain", nodeType);
  }, []);

  // Handle drag over canvas
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e?.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  // Handle drop on canvas
  const handleDrop = useCallback((e: React.DragEvent) => {
    e?.preventDefault();
    
    if (draggedNodeType) {
      const rect = canvasRef?.current?.getBoundingClientRect();
      if (rect) {
        const position = snapToGrid({
          x: e?.clientX - rect?.left - NODE_WIDTH / 2,
          y: e?.clientY - rect?.top - NODE_HEIGHT / 2
        });
        
        const newNode = addNode(draggedNodeType, position);
        
        // Automatically handle mouse down for the newly added node
        setTimeout(() => {
          if (newNode) {
            setSelectedNode(newNode);
          }
        }, 50);
      }
    }
    
    setDraggedNodeType(null);
  }, [draggedNodeType, addNode, snapToGrid]);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const rect = canvasRef?.current?.getBoundingClientRect();
    if (rect) {
      const x = e?.clientX - rect?.left;
      const y = e?.clientY - rect?.top;
      
      // Only clear preview if actually leaving the canvas area
      if (x < 0 || y < 0 || x > rect?.width || y > rect?.height) {
        // Handle drag leave
      }
    }
  }, []);

  // Handle mouse down on node
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e?.stopPropagation();
    const node = nodes?.find(n => n?.id === nodeId);
    if (!node) {
      return;
    }

    if (e?.shiftKey && editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"])) {
      // Shift + click to start connection

      // Check connection limits
      const outgoingConnections = connections?.filter(conn => conn?.source === nodeId);
      const maxConnections = (node?.type === "decision" || node?.type === "sla") ? 2 : 1;
      
      if (outgoingConnections.length >= maxConnections) {
        const nodeTypeName = node?.type === "decision" ? t("crud.workflow.builder.toolbar.nodes.decision")
          : (node?.type === "sla" && t("crud.workflow.builder.toolbar.nodes.sla") || "");
        // alert(`${nodeTypeName} node already has maximum connections`);
        alert(`${t("crud.workflow.builder.node.validation.maximum_connections").replace("_NODE_", nodeTypeName)}`);
        return;
      }
      
      // For decision or sla nodes, determine Yes/No connection
      if (node?.type === "decision" || node?.type === "sla") {
        const hasYes = outgoingConnections?.some(conn => conn?.label === "yes");
        const hasNo = outgoingConnections?.some(conn => conn?.label === "no");
        
        if (!hasYes) {
          setConnectingFrom("yes");
        }
        else if (!hasNo) {
          setConnectingFrom("no");
        }
        else {
          const nodeTypeName = node?.type === "decision" ? t("crud.workflow.builder.toolbar.nodes.decision") : t("crud.workflow.builder.toolbar.nodes.sla");
          // alert(`${nodeTypeName} node already has both Yes and No connections`);
          alert(`${t("crud.workflow.builder.node.validation.determine_connections").replace("_NODE_", nodeTypeName)}`);
          return;
        }
      }
      else {
        setConnectingFrom(null);
      }

      setIsConnecting(nodeId);
    }
    else {
      // Regular click to drag
      const rect = canvasRef?.current?.getBoundingClientRect();
      if (rect && editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"])) {
        setIsDragging(nodeId);
        setDragOffset({
          x: e?.clientX - rect?.left - node?.position?.x,
          y: e?.clientY - rect?.top - node?.position?.y
        });
      }
    }
    setSelectedNode(node);
  }, [
    connections,
    editable,
    nodes,
    permissions,
    t
  ]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef?.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const mousePos = {
      x: e?.clientX - rect?.left,
      y: e?.clientY - rect?.top
    };

    if (isDragging) {
      const newPosition = snapToGrid({
        x: mousePos?.x - dragOffset?.x,
        y: mousePos?.y - dragOffset?.y
      });

      setNodes(prev => prev?.map(node => 
        node?.id === isDragging ? { ...node, position: newPosition } : node
      ));
    }
    else if (isConnecting) {
      setTempConnection(snapToGrid(mousePos));
    }
  }, [
    dragOffset,
    isConnecting,
    isDragging,
    snapToGrid
  ]);

  // Handle mouse up
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isConnecting) {
      // Check if we"re over a node
      const target = e?.target as Element;
      const nodeElement = target?.closest("[data-node-id]");
      if (nodeElement) {
        const targetNodeId = nodeElement?.getAttribute("data-node-id");
        if (targetNodeId && targetNodeId !== isConnecting) {
          // Validate connection
          const targetNode = nodes?.find(n => n?.id === targetNodeId);
          const sourceNode = nodes?.find(n => n?.id === isConnecting);
          
          if (targetNode && sourceNode) {
            // Check if target can accept connections (start nodes cannot be targets)
            if (targetNode?.type === "start") {
              alert("Cannot connect to Start node");
              setIsConnecting(null);
              setConnectingFrom(null);
              setTempConnection(null);
              return;
            }
            
            // Check for duplicate connections
            const existingConnection = connections.find(conn => 
              conn?.source === isConnecting && conn.target === targetNodeId
            );
            
            if (existingConnection) {
              alert("Connection already exists");
              setIsConnecting(null);
              setConnectingFrom(null);
              setTempConnection(null);
              return;
            }
            
            const newConnection: Connection = {
              id: `connection-${Date.now()}`,
              source: isConnecting,
              target: targetNodeId,
              label: connectingFrom || undefined
            };
            setConnections(prev => [...prev, newConnection]);
          }
        }
      }
      setIsConnecting(null); 
      setConnectingFrom(null);
      setTempConnection(null);
    }
    setIsDragging(null);
  }, [
    connectingFrom,
    connections,
    isConnecting,
    nodes
  ]);

  // Delete node
  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev?.filter(n => n?.id !== nodeId));
    setConnections(prev => prev?.filter(c => c?.source !== nodeId && c?.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  // Update node data
  const updateNodeData = useCallback((nodeId: string, updates: Partial<WorkflowNode["data"]>) => {
    setNodes(prev => prev?.map(node => 
      node?.id === nodeId 
        ? { ...node, data: { ...node?.data, ...updates } }
        : node
    ));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, data: { ...prev?.data, ...updates } } : null);
    }
  }, [selectedNode]);

  // Import JSON workflow
  const importJsonWorkflow = useCallback(() => {
    try {
      const workflowData = JSON.parse(importJsonText);
      
      // Validate imported data structure
      if (!workflowData?.nodes || !workflowData?.connections || !workflowData?.metadata) {
        throw new Error("Invalid workflow format");
      }
      
      setNodes(workflowData?.nodes);
      setConnections(workflowData?.connections);
      setWorkflowMetadata(workflowData?.metadata);
      setImportJsonText("");
      setShowImportDialog(false);
    }
    catch (error) {
      alert("Invalid JSON format. Please check your input.");
      console.error("Import error:", error);
    }
  }, [importJsonText]);

  // Import from file
  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const content = e?.target?.result as string;
        setImportJsonText(content);
      };
      reader.readAsText(file);
    }
  }, []);

  // Download JSON workflow
  const downloadJsonWorkflow = useCallback(() => {
    const workflowData = {
      nodes,
      connections,
      metadata: {
        ...workflowMetadata,
        updatedAt: new Date().toISOString()
      }
    };
    
    const jsonString = JSON.stringify(workflowData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflowMetadata?.title?.replace(/\s+/g, "_").toLowerCase()}_workflow.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [nodes, connections, workflowMetadata]);

  // Copy JSON to clipboard
  const copyJsonToClipboard = useCallback(async () => {
    const workflowData = {
      nodes,
      connections,
      metadata: {
        ...workflowMetadata,
        updatedAt: new Date().toISOString()
      }
    };
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(workflowData, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
    catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  }, [nodes, connections, workflowMetadata]);

  // Save workflow
  const saveWorkflow = useCallback(async () => {
    const errors = validateWorkflow();
    setValidationErrors(errors);

    if (errors?.length > 0) {
      return; // Don"t save if there are validation errors
    }

    const workflowData: WorkflowData = {
      nodes,
      connections,
      metadata: {
        ...workflowMetadata,
        updatedAt: new Date().toISOString()
      }
    };
    onSave?.(workflowData);
    setShowJsonPreview(false);

    try {
      setLoading(true);

      let response;
      if (workflowId && workflowId !== "new" && permissions?.hasAnyPermission(["workflow.update"])) {
        response = await updateWorkflow({ id: workflowId, data: workflowData })?.unwrap();
      }
      else if (permissions?.hasAnyPermission(["workflow.create"])) {
        response = await createWorkflow(workflowData)?.unwrap();
      }

      if (response?.status) {
        addToast("success", `Workflow Management: ${response?.desc || response?.msg || "Save successfully"}`);
        setTimeout(() => {
          window.location.replace(`/workflow/list/`);
        }, 1000);
      }
      else {
        throw new Error(response?.desc || response?.msg || "Unknown error");
      }
    }
    catch (error) {
      addToast("error", `Workflow Management: ${error}`);
    }
    finally {
      setLoading(false);
    }
  }, [
    connections,
    nodes,
    permissions,
    workflowId,
    workflowMetadata,
    addToast,
    createWorkflow,
    onSave,
    updateWorkflow,
    validateWorkflow,
  ]);

  // Show JSON preview before save
  const handleSaveClick = useCallback(() => {
    const errors = validateWorkflow();
    setValidationErrors(errors);
    setShowJsonPreview(true);
  }, [validateWorkflow]);

  // Get node position by ID
  const getNodePosition = useCallback((nodeId: string): Position => {
    const node = nodes?.find(n => n?.id === nodeId);
    return node ? node?.position : { x: 0, y: 0 };
  }, [nodes]);

  return (
    <>
      <div className="xl:flex bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-700">
        {/* Hidden file input */}
        <input
          type="file"
          accept=".json"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileImport}
        />

        {/* Toolbar */}
        <div className="xl:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 rounded-l-2xl rounded-r-2xl xl:rounded-r-none">
          {/* Workflow Metadata */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 cursor-default">
              {t("crud.workflow.builder.toolbar.header")}
            </h3>
            
            {/* Title Input */}
            <div className="mb-2">
              <label htmlFor="workflowMetadata.title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t("crud.workflow.builder.metadata.title.label")}:
              </label>

              {editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                <Input
                  type="text"
                  id="workflowMetadata.title"
                  placeholder={t("crud.workflow.builder.metadata.title.placeholder")}
                  value={workflowMetadata?.title}
                  onChange={e => updateWorkflowMetadata({ title: e?.target?.value })}
                />
              : <div className="w-full appearance-none text-sm bg-transparent text-gray-900 dark:text-white cursor-default">
                  {workflowMetadata?.title || t("crud.workflow.builder.metadata.title.default")}
                </div>
              }
            </div>

            {/* Description Input */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t("crud.workflow.builder.metadata.description.label")}:
              </label>

              {editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                <TextArea
                  placeholder={t("crud.workflow.builder.metadata.description.placeholder")}
                  rows={2}
                  value={workflowMetadata?.description}
                  onChange={value => updateWorkflowMetadata({ description: value })}
                />
              : <div className="w-full appearance-none text-sm bg-transparent text-gray-900 dark:text-white cursor-default">
                  {workflowMetadata?.description || "-"}
                </div>
              }
            </div>

            {/* Status Selector */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t("crud.workflow.builder.metadata.status.label")}:
              </label>

              {editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                <Select
                  className="cursor-pointer"
                  options={workflowStatusesOptions || []}
                  placeholder={t("crud.workflow.builder.metadata.status.placeholder")}
                  value={workflowMetadata?.status}
                  onChange={value => updateWorkflowMetadata({ status: (value as WorkflowData["metadata"]["status"]) })}
                />
              : <div className="w-full appearance-none text-sm bg-transparent text-gray-900 dark:text-white cursor-default">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${workflowStatuses?.find(s => s?.value === workflowMetadata?.status)?.color || "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800"}
                  `}>
                    {workflowStatuses?.find(s => s?.value === workflowMetadata?.status)?.label}
                  </span>
                </div>
              }
            </div>

            {/*
            {editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) && (
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Status
                </label>

                <Select
                  className="cursor-pointer"
                  options={workflowStatusesOptions || []}
                  placeholder="Select Status"
                  value={workflowMetadata?.status}
                  onChange={value => updateWorkflowMetadata({ status: (value as WorkflowData["metadata"]["status"]) })}
                />
              </div>
            )}
            */}

            {/* Status Badge */}
            {/*
            {!editable && (
              <div className="flex items-center gap-2 cursor-default mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Current Status:
                </span>

                <span className={`px-2 py-1 rounded-full text-xs font-medium
                  ${workflowStatuses?.find(s => s?.value === workflowMetadata?.status)?.color || "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800"}
                `}>
                  {workflowStatuses?.find(s => s?.value === workflowMetadata?.status)?.label}
                </span>
              </div>
            )}
            */}
            
            {/* SLA Input */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t("crud.workflow.builder.metadata.total_sla")}:
              </label>

              {editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                <div className=" h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800 cursor-default">
                  {workflowMetadata?.totalSla || 0} {t("crud.workflow.unit.sla.abbr")}
                </div>
              : <div className="w-full appearance-none text-sm bg-transparent text-gray-900 dark:text-white cursor-default">
                  {workflowMetadata?.totalSla || 0} {t("crud.workflow.unit.sla.abbr")}
                </div>
              }
            </div>
          </div>

          {editable && (
            <PermissionGate permissions={["workflow.create", "workflow.update"]}>
              {/* Node Types */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 cursor-default">
                  {t("crud.workflow.builder.toolbar.nodes.header")}
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {Object?.entries(nodeTypes)?.map(([type, config]) => {
                    return (
                      <div
                        key={type}
                        className={`flex items-center gap-2 p-2 rounded-lg transition-colors cursor-grab active:cursor-grabbing select-none ${config?.button}`}
                        draggable
                        title={`${t("crud.workflow.builder.toolbar.actions.adding")}: ${config?.label}`}
                        onDragStart={e => handleDragStart(e, type as WorkflowNode["type"])}
                        onClick={() => addNode(type as WorkflowNode["type"])}
                      >
                        <span className="text-xs text-center w-100">
                          {config.label || ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </PermissionGate>
          )}

          <div className="mb-4 border-t border-gray-200 dark:border-gray-700"></div>

          {editable && (
            <PermissionGate permissions={["workflow.create", "workflow.update"]}>
              {/* Actions */}
              <div className="mb-2">
                <Button
                  className="w-full mb-2"
                  variant="success"
                  onClick={() => setShowImportDialog(true)}
                >
                  <FileIcon className="w-4 h-4 mr-1" /> {t("crud.workflow.builder.toolbar.actions.import")}
                </Button>

                <Button
                  className="w-full mb-2"
                  variant="info"
                  onClick={() => setShowComponentsPreview(true)}
                >
                  <BoxCubeIcon className="w-4 h-4 mr-1" /> {t("crud.workflow.builder.toolbar.actions.preview")}
                </Button>

                <Button
                  className="w-full mb-2"
                  variant="primary"
                  onClick={handleSaveClick}
                >
                  <DownloadIcon className="w-4 h-4 mr-1" /> {t("crud.workflow.builder.toolbar.actions.save")}
                </Button>
              </div>

              {/* Instructions */}
              <div className="text-xs text-gray-500 dark:text-gray-400 cursor-default">
                {language === "th" && (
                  <>
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>การจัดการ SOP:</strong>
                    </p>
                    <p>• ตัวบ่งชี้ลำดับความสำคัญแบบภาพในแผงสรุป</p>

                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>การทำงานของโหนด:</strong>
                    </p>
                    <p>• คลิกโหนดเพื่อเพิ่มที่ด้านบนซ้ายของผืนผ้าใบที่มองเห็นได้</p>
                    <p>• ลากโหนดจากจานสีไปยังผืนผ้าใบ</p>
                    <p>• คลิกเพื่อเลือกโหนด</p>
                    <p>• ลากเพื่อย้ายโหนด (สแนปไปยังตาราง)</p>
                    <p>• กด Shift+คลิกเพื่อเชื่อมต่อโหนด</p>
                    <p>• โหนดการตัดสินใจและ SLA มีตัวเชื่อมต่อแบบใช่/ไม่ใช่</p>

                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>คุณสมบัติเวิร์กโฟลว์:</strong>
                    </p>
                    <p>• ต้องใช้โหนดเริ่มต้น/สิ้นสุดสำหรับการบันทึก</p>
                    <p>• การเชื่อมต่อสูงสุด: 1 (ปกติ), 2 (การตัดสินใจ/SLA)</p>
                    <p>• นำเข้า/ส่งออกเวิร์กโฟลว์ JSON</p>
                    <p>• ดูตัวอย่างส่วนประกอบของแบบฟอร์ม</p>
                    <p>• เลื่อนเพื่อดูเวิร์กโฟลว์ขนาดใหญ่</p>
                  </>
                ) ||
                  <>
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>SOP Management:</strong>
                    </p>
                    <p>• Visual priority indicators in summary panel</p>

                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>Node Operations:</strong>
                    </p>
                    <p>• Click nodes to add at top-left of visible canvas</p>
                    <p>• Drag nodes from palette to canvas</p>
                    <p>• Click to select nodes</p>
                    <p>• Drag to move nodes (snaps to grid)</p>
                    <p>• Shift+click to connect nodes</p>
                    <p>• Decision and SLA nodes have Yes/No connectors</p>

                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>Workflow Features:</strong>
                    </p>
                    <p>• Start/End nodes required for save</p>
                    <p>• Max connections: 1 (normal), 2 (decision/SLA)</p>
                    <p>• Import/Export JSON workflows</p>
                    <p>• Preview form components</p>
                    <p>• Scroll for large workflows</p>
                  </>
                }
              </div>
            </PermissionGate>
          )}

          {workflowId !== "new" && workflowAction !== "edit" && (
            <>
              <Button
                className="w-full mb-2"
                variant="info"
                onClick={() => setShowComponentsPreview(true)}
              >
                <BoxCubeIcon className="w-4 h-4 mr-1" /> {t("crud.workflow.builder.toolbar.actions.preview")}
              </Button>

              <PermissionGate permissions={["workflow.update"]}>
                <div className="mb-2">
                  <Button
                    className="w-full mb-2"
                    variant="warning"
                    onClick={() => window.location.replace(`/workflow/editor/v3/${workflowId}/edit`)}
                  >
                    <PencilIcon className="w-4 h-4 mr-1" /> {t("crud.workflow.builder.toolbar.actions.edit")}
                  </Button>
                </div>
              </PermissionGate>
            </>
          )}
        </div>

        {/* Canvas */}
        <div className="xl:flex-1 relative xl:overflow-x-auto xl:overflow-y-auto min-h-lvh">
          <div
            ref={canvasRef}
            className={`min-w-full min-h-full relative 
              ${editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`
            }
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <svg
              className="xl:absolute inset-0"
              ref={svgRef}
              style={{ width: "2000px", height: "2000px", zIndex: 1 }}
            >
              {/* Grid Pattern */}
              <defs>
                <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                  <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                </pattern>
                <pattern id="major-grid" width={GRID_SIZE * 5} height={GRID_SIZE * 5} patternUnits="userSpaceOnUse">
                  <path d={`M ${GRID_SIZE * 5} 0 L 0 0 0 ${GRID_SIZE * 5}`} fill="none" stroke="#d1d5db" strokeWidth="1"/>
                </pattern>
                <pattern id="grid-dark" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                  <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="#555555" strokeWidth="1"/>
                </pattern>
                <pattern id="major-grid-dark" width={GRID_SIZE * 5} height={GRID_SIZE * 5} patternUnits="userSpaceOnUse">
                  <path d={`M ${GRID_SIZE * 5} 0 L 0 0 0 ${GRID_SIZE * 5}`} fill="none" stroke="#666666" strokeWidth="1"/>
                </pattern>
              </defs>

              <rect width="100%" height="100%" fill="url(#grid)" className="dark:hidden" />
              <rect width="100%" height="100%" fill="url(#major-grid)" className="dark:hidden" />
              <rect width="100%" height="100%" fill="url(#grid-dark)" className="hidden dark:block" />
              <rect width="100%" height="100%" fill="url(#major-grid-dark)" className="hidden dark:block" />

              {/* Connections */}
              {connections?.map(connection => {
                const sourcePos = getNodePosition(connection?.source);
                const targetPos = getNodePosition(connection?.target);
                const sourcePoint = getNodeConnectionPoint(sourcePos, targetPos, true);
                const targetPoint = getNodeConnectionPoint(sourcePos, targetPos, false);
                
                // Determine if connection is vertical (straight line) or horizontal (curve)
                const isVertical = Math?.abs(sourcePoint?.x - targetPoint?.x) < 10;
                
                let pathD;
                if (isVertical) {
                  // Straight line for vertical connections
                  pathD = `M ${sourcePoint?.x},${sourcePoint?.y} L ${targetPoint?.x},${targetPoint?.y}`;
                }
                else {
                  // Curved line for horizontal connections
                  const midX = (sourcePoint?.x + targetPoint?.x) / 2;
                  pathD = `M ${sourcePoint?.x},${sourcePoint?.y} C ${midX},${sourcePoint?.y} ${midX},${targetPoint?.y} ${targetPoint?.x},${targetPoint?.y}`;
                }
                
                // Calculate label position
                const labelX = (sourcePoint?.x + targetPoint?.x) / 2;
                const labelY = (sourcePoint?.y + targetPoint?.y) / 2;
                
                return (
                  <g key={connection?.id}>
                    <path
                      d={pathD}
                      fill="none"
                      markerEnd="url(#arrowhead)"
                      stroke="#cccccc"
                      strokeWidth="2"
                    />

                    {connection?.label && (
                      <g>
                        <circle
                          cx={labelX}
                          cy={labelY}
                          fill="white"
                          r="12"
                          stroke="#6b7280"
                          strokeWidth="1"
                        />

                        <text
                          dominantBaseline="central"
                          fill="#374151"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                          x={labelX}
                          y={labelY}
                        >
                          {connection?.label === "yes" && "Y" || "N"}
                        </text>
                      </g>
                    )}
                  </g>
                );
              }) || null}

              {/* Temporary connection while dragging */}
              {isConnecting && tempConnection && (
                <g>
                  <path
                    d={`M 
                      ${getNodeConnectionPoint(getNodePosition(isConnecting), tempConnection, true)?.x},
                      ${getNodeConnectionPoint(getNodePosition(isConnecting), tempConnection, true)?.y} L 
                      ${tempConnection?.x},${tempConnection?.y}
                    `}
                    fill="none"
                    stroke="#3b82f6"
                    strokeDasharray="5,5"
                    strokeWidth="2"
                  />

                  {connectingFrom && (
                    <text
                      x={tempConnection?.x + 10}
                      y={tempConnection?.y - 10}
                      fontSize="12"
                      fill="#3b82f6"
                      fontWeight="bold"
                    >
                      {connectingFrom?.toUpperCase()}
                    </text>
                  )}
                </g>
              )}

              {/* Arrow marker */}
              <defs>
                <marker
                  id="arrowhead"
                  markerHeight="7"
                  markerWidth="10"
                  orient="auto"
                  refX="10"
                  refY="3.5"
                >
                  <polygon
                    fill="#6b7280"
                    points="0 0, 10 3.5, 0 7"
                  />
                </marker>
              </defs>
            </svg>

            {/* Nodes */}
            {nodes?.map(node => {
              const nodeConfig = nodeTypes[node?.type];
              const isSelected = selectedNode?.id === node?.id;
              const isContinueFromWorkflow = node?.type === "start" && node?.data?.config?.continueFromWorkflow;
              const isAllowContinuation = node?.type === "end" && node?.data?.config?.allowContinuation;
              
              return (
                <div
                  key={node?.id}
                  data-node-id={node?.id}
                  className={`absolute pointer-events-auto select-none transition-all rounded-lg ${isSelected ?
                      "ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-0" : ""
                    } ${editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) ? (isDragging === node?.id ?
                      "cursor-grabbing" : "cursor-grab") : "cursor-default"}
                  `}
                  style={{
                    left: node?.position?.x,
                    top: node?.position?.y,
                    zIndex: 2
                  }}
                  onMouseDown={e => handleNodeMouseDown(e, node?.id)}
                >
                  {(node.type === "decision" || node.type === "sla") ? (
                    // Diamond shape for decision nodes
                    <div className="relative w-24 h-16 flex items-center justify-center">
                      <svg width="96" height="64" className="absolute inset-0">
                        <polygon
                          points="48,4 88,32 48,60 8,32"
                          fill={node?.type === "decision" ? "rgb(234 179 8)" : "rgb(168 85 247)"}
                          stroke="white"
                          strokeWidth="2"
                          className="drop-shadow-lg"
                        />
                      </svg>

                      <div className="relative z-10 flex flex-col items-center justify-center text-white dark:text-gray-900">
                        <span className="text-xs font-medium truncate px-1 max-w-16 text-center">
                          {node.data.label}
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Rectangle shape for other nodes
                    <div className={`w-24 h-16 rounded-lg border-2 border-white dark:border-gray-900 shadow-lg flex flex-col items-center justify-center text-white dark:text-gray-900 ${nodeConfig.color}`}>
                      <span className="text-xs font-medium truncate px-1">
                        {node.data.label}
                      </span>

                      {/* Visual indicators for workflow continuation */}
                      {isContinueFromWorkflow ? (
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-400 border border-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xs">
                            <AngleLeftIcon className="w-3 h-3" />
                          </span>
                        </div>
                      ) : ""}
                      
                      {/* Visual indicators for workflow continuation */}
                      {isAllowContinuation ? (
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 border border-green-600 rounded-full flex items-center justify-center">
                          <span className="text-xs">
                            <AngleRightIcon className="w-3 h-3" />
                          </span>
                        </div>
                      ) : ""}
                    </div>
                  )}
                  
                  {isSelected && editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) && (
                    <button
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 border border-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      onClick={e => {
                        e?.stopPropagation();
                        deleteNode(node?.id);
                      }}
                    >
                      <TrashBinIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            }) || null}
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="xl:w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 rounded-r-2xl rounded-l-2xl xl:rounded-l-none">
          <div className="flex items-center gap-2 mb-2">
            <PencilIcon className="w-5 h-5 text-lg font-semibold text-gray-700 dark:text-gray-200" />

            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 cursor-default">
              {t("crud.workflow.builder.node.header")}
            </h3>
          </div>

          {/* Validation Errors */}
          {validationErrors?.length > 0 && (
            <div className="cursor-default mb-2">
              <Alert
                title={t("crud.workflow.builder.node.validation.header")}
                messages={validationErrors}
                showLink={false}
                variant="error"
              />
            </div>
          )}

          {selectedNode ? (
            <div className="space-y-2">
              <div>
                <label htmlFor="selectedNode.data.label" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  {t("crud.workflow.builder.node.form.label.label")}
                </label>

                {editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                  <Input
                    type="text"
                    id="selectedNode.data.label"
                    value={selectedNode?.data?.label}
                    onChange={e => updateNodeData(selectedNode?.id, { label: e?.target?.value })}
                  />
                : <div className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default">
                    {selectedNode?.data?.label || ""}
                  </div>
                }
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  {t("crud.workflow.builder.node.form.description.label")}
                </label>

                {editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                  <TextArea
                    value={selectedNode?.data?.description || ""}
                    placeholder={t("crud.workflow.builder.node.form.description.placeholder")}
                    rows={1}
                    onChange={value => updateNodeData(selectedNode?.id, { description: value })}
                  />
                : <div className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default">
                    {selectedNode?.data?.description || ""}
                  </div>
                }
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  {t("crud.workflow.builder.node.form.node_type.label")}
                </label>

                <div className="flex items-center gap-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {nodeTypes[selectedNode?.type]?.label || ""}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  {t("crud.workflow.builder.node.form.position.label")}
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="selectedNode.position.x" className="block text-xs text-gray-500 dark:text-gray-400">
                      X
                    </label>
                    
                    {editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                      <Input
                        type="number"
                        id="selectedNode.position.x"
                        step={GRID_SIZE}
                        value={Math?.round(selectedNode?.position?.x)}
                        onChange={e => {
                          const newPosition = snapToGrid({ 
                            x: parseInt(e?.target?.value) || 0, 
                            y: selectedNode?.position?.y 
                          });
                          const newNodes = nodes.map(n => n?.id === selectedNode?.id ? { ...n, position: newPosition } : n);
                          setNodes(newNodes);
                          setSelectedNode({ ...selectedNode, position: newPosition });
                        }}
                      />
                    : <div className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default">
                        {Math?.round(selectedNode?.position?.x) || 0}
                      </div>
                    }
                  </div>

                  <div>
                    <label htmlFor="selectedNode.position.y" className="block text-xs text-gray-500 dark:text-gray-400">
                      Y
                    </label>

                    {editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                      <Input
                        type="number"
                        id="selectedNode.position.y"
                        step={GRID_SIZE}
                        value={Math?.round(selectedNode?.position?.y)}
                        onChange={e => {
                          const newPosition = snapToGrid({ 
                            x: selectedNode?.position?.x, 
                            y: parseInt(e?.target?.value) || 0 
                          });
                          const newNodes = nodes?.map(n => n?.id === selectedNode?.id ? { ...n, position: newPosition } : n);
                          setNodes(newNodes);
                          setSelectedNode({ ...selectedNode, position: newPosition });
                        }}
                      />
                    : <div className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default" >
                        {Math?.round(selectedNode?.position?.y) || 0}
                      </div>
                    }
                  </div>
                </div>
              </div>

              {/* Type-specific configuration */}
              {selectedNode?.type === "decision" && (
                <div>
                  <label htmlFor="selectedNode.data.config.condition" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {t("crud.workflow.builder.node.form.conditions.label")}
                  </label>

                  {editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                    <Input
                      type="text"
                      id="selectedNode.data.config.condition"
                      placeholder={t("crud.workflow.builder.node.form.conditions.placeholder")}
                      value={typeof selectedNode?.data?.config?.condition === "string" ? selectedNode?.data?.config?.condition : ""}
                      onChange={e => updateNodeData(selectedNode?.id, { 
                        config: { ...(selectedNode?.data?.config ?? {}), condition: e?.target?.value }
                      })}
                    />
                  : <div className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default">
                      {typeof selectedNode?.data?.config?.condition === "string" ? selectedNode?.data?.config?.condition : ""}
                    </div>
                  }
                </div>
              )}

              {selectedNode?.type === "sla" && (
                <div>
                  <label htmlFor="selectedNode.data.config.SLA" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {t("crud.workflow.builder.node.form.sla.label")}
                  </label>

                  {editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                    <Input
                      type="number"
                      id="selectedNode.data.config.SLA"
                      max="720"
                      min="1"
                      // placeholder="Enter SLA in minutes..."
                      value={
                        typeof selectedNode?.data?.config?.SLA === "string" || typeof selectedNode?.data?.config?.SLA === "number"
                        ? selectedNode?.data?.config?.SLA : ""
                      }
                      onChange={(e) => updateNodeData(selectedNode.id, { 
                        config: { ...selectedNode?.data?.config, SLA: e?.target?.value }
                      })}
                    />
                  : <div className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-500 dark:text-gray-400 cursor-default">
                      {
                        typeof selectedNode?.data?.config?.SLA === "string" || typeof selectedNode?.data?.config?.SLA === "number"
                        ? selectedNode?.data?.config?.SLA : ""
                      }
                    </div>
                  }
                </div>
              )}

              {(selectedNode?.type === "process" || selectedNode?.type === "dispatch") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      {t("crud.workflow.builder.node.form.actions.label")}
                    </label>

                    {editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                      <Select
                        className="bg-white dark:bg-gray-900 cursor-pointer"
                        options={caseStatusOptions || []}
                        placeholder={t("crud.workflow.builder.node.form.actions.placeholder")}
                        value={typeof selectedNode?.data?.config?.action === "string" ? selectedNode?.data?.config?.action : ""}
                        onChange={value => updateNodeData(selectedNode?.id, {
                          config: { ...selectedNode?.data?.config, action: value }
                        })}
                      />
                    : <div className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default">
                        {caseStatusOptions?.find(a => a?.value === selectedNode?.data?.config?.action)?.label || ""}
                      </div>
                    }
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      {t("crud.workflow.builder.node.form.form.label")}
                    </label>

                    {editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                      <Select
                        className="bg-white dark:bg-gray-900 cursor-pointer"
                        options={formOptions || []}
                        placeholder={t("crud.workflow.builder.node.form.form.placeholder")}
                        value={typeof selectedNode?.data?.config?.formId === "string" ? selectedNode?.data?.config?.formId : ""}
                        onChange={value => updateNodeData(selectedNode?.id, { 
                          config: { ...selectedNode?.data?.config, formId: value }
                        })}
                      />
                    : <div className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default">
                        {formOptions?.find(f => f?.value === selectedNode?.data?.config?.formId)?.label || ""}
                      </div>
                    }
                  </div>

                  <div>
                    <label htmlFor="selectedNode.data.config.sla" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      {t("crud.workflow.builder.node.form.sla.label")}
                    </label>

                    {editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                      <Input
                        type="number"
                        id="selectedNode.data.config.sla"
                        max="720"
                        min="1"
                        // placeholder="Enter SLA in minutes..."
                        value={
                          typeof selectedNode?.data?.config?.sla === "string" || typeof selectedNode?.data?.config?.sla === "number"
                          ? selectedNode?.data?.config?.sla : ""
                        }
                        onChange={e => updateNodeData(selectedNode?.id, { 
                          config: { ...selectedNode?.data?.config, sla: e?.target?.value }
                        })}
                      />
                    : <div className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default">
                        {typeof selectedNode.data.config?.sla === "string" || typeof selectedNode.data.config?.sla === "number" ? selectedNode.data.config.sla : ""}
                      </div>
                    }
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      {t("crud.workflow.builder.node.form.group.label")}
                    </label>

                    {editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                      <CustomizableSelect
                        options={groupOptions || []}
                        placeholder={t("crud.workflow.builder.node.form.group.placeholder")}
                        value={Array?.isArray(selectedNode?.data?.config?.group) ? selectedNode?.data?.config?.group : []}
                        onChange={value => updateNodeData(selectedNode?.id, {
                          config: { ...selectedNode?.data?.config, group: value }
                        })}
                      />
                    : <div className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default">
                        {Array?.isArray(selectedNode?.data?.config?.group) ? selectedNode?.data?.config?.group?.map(
                          group => groupOptions?.find(g => g?.value === group)?.label
                        ).join(", ") : ""}
                      </div>
                    }
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      {t("crud.workflow.builder.node.form.pic.label")}
                    </label>

                    {editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                      <CustomizableSelect
                        options={userOptions || []}
                        placeholder={t("crud.workflow.builder.node.form.pic.placeholder")}
                        value={Array?.isArray(selectedNode?.data?.config?.pic) ? selectedNode?.data?.config?.pic : []}
                        onChange={value => updateNodeData(selectedNode.id, { 
                          config: { ...selectedNode?.data?.config, pic: value }
                        })}
                      />
                    : <div className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default">
                        {Array?.isArray(selectedNode?.data?.config?.pic) ? selectedNode?.data?.config?.pic?.map(
                          pic => userOptions?.find(u => u?.value === pic)?.label
                        ).join(", ") : ""}
                      </div>
                    }
                  </div>
                </>
              )}

              {/* Connection Info */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 cursor-default">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t("crud.workflow.builder.node.connections.header")}
                </h4>

                <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <div>
                    {t("crud.workflow.builder.node.connections.outgoing")}: {connections?.filter(c => c?.source === selectedNode?.id)?.length}
                    {(selectedNode?.type === "decision" || selectedNode?.type === "sla") && " / 2 (Yes/No)"}
                    {selectedNode?.type !== "decision" && selectedNode?.type !== "sla" && " / 1"}
                  </div>

                  <div>{t("crud.workflow.builder.node.connections.incoming")}: {connections?.filter(c => c?.target === selectedNode?.id)?.length}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-600 dark:text-gray-300 py-8 cursor-default">
              <PencilIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />

              <p>
                {t("crud.workflow.builder.node.description")}
              </p>
            </div>
          )}

          {/* Workflow Stats */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 cursor-default">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t("crud.workflow.builder.node.stats.header")}
            </h4>

            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <div>
                {t("crud.workflow.builder.node.stats.title")}: <span className="font-medium">{workflowMetadata?.title || ""}</span>
              </div>

              <div>
                {t("crud.workflow.builder.node.stats.status")}: <span className={`px-1 py-0.5 rounded text-xs ${
                          workflowStatuses?.find(s => s?.value === workflowMetadata?.status)?.color
                          || "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-900"
                        }`}>
                          {workflowStatuses?.find(s => s?.value === workflowMetadata?.status)?.label}
                        </span>
              </div>

              <div>{t("crud.workflow.builder.node.stats.nodes")}: {nodes?.length || 0}</div>

              <div>{t("crud.workflow.builder.node.stats.connections")}: {connections?.length || 0}</div>

              <div>{t("crud.workflow.builder.node.stats.start_nodes")}: {nodes?.filter(n => n?.type === "start")?.length || 0}</div>

              <div>{t("crud.workflow.builder.node.stats.end_nodes")}: {nodes?.filter(n => n?.type === "end")?.length || 0}</div>
            </div>
          </div>
        </div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />

        {/* JSON Preview Dialog */}
        {showJsonPreview && editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) && (
          <Modal className="max-w-4xl p-6" isOpen={showJsonPreview} onClose={() => setShowJsonPreview(loading && true || false)}>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 cursor-default">
                {t("crud.workflow.builder.modal.save.header")}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-300 cursor-default">
                {workflowMetadata?.title || ""}
              </p>
            </div>
            
            <div className="p-4 overflow-auto max-h-[60vh]">
              <pre className="bg-white dark:bg-gray-900 p-4 rounded-lg text-sm overflow-auto text-gray-800 dark:text-gray-100">
                {JSON.stringify({ 
                  nodes, 
                  connections, 
                  metadata: {
                    ...workflowMetadata,
                    updatedAt: new Date().toISOString()
                  }
                }, null, 2)}
              </pre>
            </div>
            
            <div className="flex items-center justify-end gap-2 p-4">
              <Button
                disabled={loading}
                variant="error"
                onClick={() => setShowJsonPreview(false)}
              >
                {t("crud.workflow.builder.modal.actions.cancel")}
              </Button>

              <Button
                variant={`${copiedJson && "success" || "outline"}`}
                onClick={copyJsonToClipboard}
              >
                {copiedJson ? <CheckLineIcon className="w-4 h-4 mr-1" /> : <CopyIcon className="w-4 h-4 mr-1" />}
                {copiedJson ? `${t("crud.workflow.builder.modal.save.actions.copied")}!` : t("crud.workflow.builder.modal.save.actions.copy")}
              </Button>

              <Button
                disabled={loading}
                variant="outline"
                onClick={downloadJsonWorkflow}
              >
                <DownloadIcon className="w-4 h-4 mr-1" /> {t("crud.workflow.builder.modal.save.actions.download")}
              </Button>

              <Button
                disabled={validationErrors?.length > 0 || loading}
                variant={`${validationErrors?.length > 0 && "outline" || "primary"}`}
                onClick={saveWorkflow}
              >
                {loading ? t("crud.workflow.builder.modal.save.actions.saving") : (
                  <>
                    {/* <DownloadIcon className="w-4 h-4 mr-1" /> */}
                    <span>{t("crud.workflow.builder.modal.save.actions.confirm")}</span>
                  </>
                )}
              </Button>
            </div>
          </Modal>
        )}

        {/* Import Dialog */}
        {showImportDialog && editable && permissions?.hasAnyPermission(["workflow.create", "workflow.update"]) && (
          <Modal isOpen={showImportDialog} onClose={() => setShowImportDialog(false)} className="max-w-4xl p-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 cursor-default">
                {t("crud.workflow.builder.modal.import.header")}
              </h3>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t("crud.workflow.builder.modal.import.file.label")}
                </label>

                <input
                  type="file"
                  accept=".json"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white"
                  onChange={handleFileImport}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t("crud.workflow.builder.modal.import.textarea.label")}
                </label>

                <TextArea
                  className="w-full h-64 px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent font-mono text-sm"
                  placeholder={t("crud.workflow.builder.modal.import.textarea.placeholder")}
                  value={importJsonText || ""}
                  onChange={value => setImportJsonText(value)}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 p-4">
              <Button
                variant="error"
                onClick={() => setShowImportDialog(false)}
              >
                {t("crud.workflow.builder.modal.actions.cancel")}
              </Button>

              <Button
                disabled={!importJsonText?.trim()}
                variant={`${!importJsonText?.trim() && "outline" || "success"}`}
                onClick={importJsonWorkflow}
              >
                <FileIcon className="w-4 h-4 mr-1" /> {t("crud.workflow.builder.modal.import.actions.import")}
              </Button>
            </div>
          </Modal>
        )}

        {/* Enhanced Components Preview Modal */}
        {showComponentsPreview && (
          <Modal
            isOpen={showComponentsPreview}
            onClose={() => setShowComponentsPreview(false)}
            isFullscreen={true}
          >
            <div className="cursor-default">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {t("crud.workflow.builder.modal.preview.header")}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t("crud.workflow.builder.modal.preview.description")}
              </p>
            </div>
            
            <div className="py-4 overflow-auto cursor-default">
              {generateComponentsPreview()?.length > 0 ? (
                <div className="space-y-6">
                  {generateComponentsPreview()?.map((component, index) => (
                    <div key={component?.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 text-xs font-medium px-2 py-1 rounded-full">
                          {t("crud.workflow.builder.modal.preview.step")} {index + 1}
                        </span>
                        
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {component?.label || ""}
                        </h4>

                        {/* Component Type Badge */}
                        {component?.type === "start" && (
                          <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs font-medium px-2 py-1 rounded-full">
                            {t("crud.workflow.builder.toolbar.nodes.start")}
                          </span>
                        )}

                        {component?.type === "process" && (
                          <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs font-medium px-2 py-1 rounded-full">
                            {t("crud.workflow.builder.node.form.actions.label")}: {component?.action || ""}{" | "}
                            {t("crud.workflow.builder.node.form.sla.label")}: {component?.sla || 0} {t("crud.workflow.unit.sla.label")}{" | "}
                            {t("crud.workflow.builder.node.form.group.label")}: {component?.group || ""}{" | "}
                            {t("crud.workflow.builder.node.form.pic.label")}: {component?.pic || ""}
                          </span>
                        )}

                        {component?.type === "dispatch" && (
                          <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-xs font-medium px-2 py-1 rounded-full">
                            {t("crud.workflow.builder.toolbar.nodes.dispatch")}: {component?.action || ""}{" | "}
                            {t("crud.workflow.builder.node.form.sla.label")}: {component?.sla || 0} {t("crud.workflow.unit.sla.label")}{" | "}
                            {t("crud.workflow.builder.node.form.group.label")}: {component?.group || ""}{" | "}
                            {t("crud.workflow.builder.node.form.pic.label")}: {component?.pic || ""}
                          </span>
                        )}

                        {component?.type === "sla" && (
                          <span className="bg-green-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 text-xs font-medium px-2 py-1 rounded-full">
                            {t("crud.workflow.builder.toolbar.nodes.sla")} {component?.SLA || 0} {t("crud.workflow.unit.sla.label")}
                          </span>
                        )}

                        {component?.type === "decision" && (
                          <span className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 text-xs font-medium px-2 py-1 rounded-full">
                            {t("crud.workflow.builder.toolbar.nodes.decision")}
                          </span>
                        )}

                        {component?.type === "end" && (
                          <span className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 text-xs font-medium px-2 py-1 rounded-full">
                            {t("crud.workflow.builder.toolbar.nodes.end")}
                          </span>
                        )}
                      </div>

                      {/* Start Component */}
                      {component?.type === "start" && (
                        <div className="bg-green-100 dark:bg-green-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-green-800 dark:text-green-100">
                              {t("crud.workflow.builder.modal.preview.start")}
                            </span>

                            {component?.continueFromWorkflow && (
                              <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 text-xs font-medium px-2 py-1 rounded-full">
                                <AngleLeftIcon className="w-4 h-4 mr-1 inline" /> Continues from workflow
                              </span>
                            )}
                          </div>

                          {component?.description && (
                            <p className="text-sm text-green-700 dark:text-green-200">
                              {component.description || ""}
                            </p>
                          )}

                          {component?.continueFromWorkflow && component?.sourceWorkflowId && (
                            <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded border border-blue-200 dark:border-blue-700">
                              <p className="text-xs text-blue-700 dark:text-blue-200">
                                <strong>Source Workflow:</strong> {component?.sourceWorkflowId || ""}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Form Component */}
                      {(component?.type === "process" || component?.type === "dispatch") && component?.form && (
                        <DynamicForm edit={false} editFormData={true} enableFormTitle={false} initialForm={component?.form || null} />
                      )}

                      {component?.type === "process" && (
                        <div>
                          {component?.group && (
                            <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                              <strong>{t("crud.workflow.builder.node.form.group.label")}:</strong> {component?.group || ""}
                            </div>
                          )}

                          {component?.pic && (
                            <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                              <strong>{t("crud.workflow.builder.node.form.pic.label")}:</strong> {component?.pic || ""}
                            </div>
                          )}
                        </div>
                      )}

                      {/* SLA Component  */}
                      {component?.type === "sla" && (
                        <div className="bg-purple-100 dark:bg-purple-800 p-3 rounded border">
                          <div className="text-sm text-gray-700 dark:text-gray-200">
                            <strong>{t("crud.workflow.builder.modal.preview.sla.header")}:</strong> {component?.SLA || "-"} {t("crud.workflow.unit.sla.label")}
                          </div>

                          {/*
                          {component?.SLA && (
                            <div className="text-sm text-gray-700 dark:text-gray-200 mt-1">
                              <strong>SLA:</strong> {component?.SLA || 0}
                            </div>
                          )}
                          */}

                          {/* Interactive Toggle Buttons */}
                          <div className="mb-4 mt-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                              {t("crud.workflow.builder.modal.preview.sla.path")}:
                            </label>

                            <div className="flex gap-2">
                              <Button
                                size="xs"
                                variant={decisionSelections[component?.id] === "yes" && "success" || "outline-success"}
                                onClick={() => handleDecisionToggle(component?.id, "yes")}
                              >
                                <CheckLineIcon className="w-4 h-4 mr-1" /> {t("crud.workflow.builder.modal.preview.sla.yes")}
                              </Button>

                              <Button
                                size="xs"
                                variant={decisionSelections[component?.id] === "no" && "error" || "outline-error"}
                                onClick={() => handleDecisionToggle(component?.id, "no")}
                              >
                                <CloseIcon className="w-4 h-4 mr-1" /> {t("crud.workflow.builder.modal.preview.sla.no")}
                              </Button>
                            </div>
                          </div>

                          {/* Current Selection Display */}
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {t("crud.workflow.builder.modal.preview.current_path")}:
                            <strong className="ml-1">{decisionSelections[component?.id] === "no" &&
                              t("crud.workflow.builder.modal.preview.sla.no") || t("crud.workflow.builder.modal.preview.sla.yes")}
                            </strong>
                          </div>
                        </div>
                      )}
                      
                      {/* Decision Component */}
                      {component.type === "decision" && (
                        <div className="bg-yellow-100 dark:bg-yellow-800 p-3 rounded border">
                          <div className="text-sm text-gray-700 dark:text-gray-200">
                            <strong className="mr-1">{t("crud.workflow.builder.modal.preview.decision.header")}:</strong>
                            {component?.condition && t("common.yes") || ""}
                          </div>

                          {/* Interactive Toggle Buttons */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                              {t("crud.workflow.builder.modal.preview.decision.path")}:
                            </label>

                            <div className="flex gap-2">
                              <Button
                                size="xs"
                                variant={decisionSelections[component?.id] === "yes" && "success" || "outline-success"}
                                onClick={() => handleDecisionToggle(component?.id, "yes")}
                              >
                                <CheckLineIcon className="w-4 h-4 mr-1" /> {t("common.yes")}
                              </Button>

                              <Button
                                size="xs"
                                variant={decisionSelections[component?.id] === "no" && "error" || "outline-error"}
                                onClick={() => handleDecisionToggle(component?.id, "no")}
                              >
                                <CloseIcon className="w-4 h-4 mr-1" /> {t("common.no")}
                              </Button>
                            </div>
                          </div>

                          {/* Current Selection Display */}
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {t("crud.workflow.builder.modal.preview.current_path")}:
                            <strong className="ml-1">
                              {decisionLang?.[decisionSelections[component?.id]] || decisionLang["yes"] || "yes"}
                            </strong>
                          </div>
                        </div>
                      )}

                      {/* End Component */}
                      {component?.type === "end" && (
                        <div className="bg-red-100 dark:bg-red-800 p-4 rounded-lg border border-red-200 dark:border-red-700">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-red-800 dark:text-red-100">
                              {t("crud.workflow.builder.modal.preview.end")}
                            </span>

                            {component?.allowContinuation && (
                              <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs font-medium px-2 py-1 rounded-full">
                                <AngleLeftIcon className="w-4 h-4 mr-1" /> Allows continuation
                              </span>
                            )}
                          </div>

                          {component?.description && (
                            <p className="text-sm text-red-700 dark:text-red-200">
                              {component?.description || ""}
                            </p>
                          )}

                          {component?.allowContinuation && component?.nextWorkflowId && (
                            <div className="bg-green-100 dark:bg-green-800 p-2 rounded border border-green-200 dark:border-green-700">
                              <p className="text-xs text-green-700 dark:text-green-200">
                                <strong>Next Workflow:</strong> {component?.nextWorkflowId || ""}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileIcon className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />

                  <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                    {t("crud.workflow.builder.modal.preview.empty.title")}
                  </div>

                  <p className="text-gray-400 dark:text-gray-500">
                    {t("crud.workflow.builder.modal.preview.empty.description")}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end gap-2 p-4">
              {/*
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {Object?.keys(decisionSelections)?.length > 0 && (
                  <span>
                    Decisions: {Object?.entries(decisionSelections)?.map(([id, decision]) => {
                      const node = nodes?.find(n => n?.id === id);
                      const nodeTypeName = node?.type === "sla" && "SLA" || "Decision";
                      return `${node?.data?.label || ""} (${nodeTypeName || ""}): ${decision?.toUpperCase() || ""}`;
                    }).join(", ")}
                  </span>
                )}
              </div>
              */}

              <Button
                variant="outline"
                onClick={() => setShowComponentsPreview(false)}
              >
                {t("crud.workflow.builder.modal.preview.actions.close")}
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
};

export default WorkflowEditorComponent;
