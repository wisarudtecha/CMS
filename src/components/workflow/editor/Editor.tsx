// /src/components/workflow/editor/Editor.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AngleLeftIcon, AngleRightIcon, BoxCubeIcon, CheckLineIcon, CloseIcon, CopyIcon, DownloadIcon, FileIcon, PencilIcon, TrashBinIcon } from "@/icons";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { Modal } from "@/components/ui/modal";
import { usePermissions } from "@/hooks/usePermissions";
import type { Connection, ConnectionType, NodeType, Position, WorkflowData, WorkflowEditorComponentProps, WorkflowNode } from "@/types/workflow";
import CustomizableSelect from "@/components/form/CustomizableSelect";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import workflowData from "@/mocks/workflowData.json";
import workflowFormV02 from "@/mocks/workflowFormV02.json";

// Grid configuration
const GRID_SIZE = 20;
const NODE_WIDTH = 96; // 24 * 4 (w-24)
const NODE_HEIGHT = 64; // 16 * 4 (h-16)

// Workflow status options
const workflowStatuses = [
  { value: "draft", label: "Draft", color: "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800" },
  { value: "active", label: "Active", color: "text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-800" },
  { value: "inactive", label: "Inactive", color: "text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-800" },
  { value: "testing", label: "Testing", color: "text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800" }
] as const;

// Node type configurations
const nodeTypes = {
  start: { button: "bg-success-500 text-white dark:text-white hover:bg-success-600", color: "bg-success-500 dark:bg-success-400", label: "Start" },
  process: { button: "bg-brand-500 text-white dark:text-white hover:bg-brand-600", color: "bg-brand-500 dark:bg-brand-400", label: "Process" },
  decision: { button: "bg-warning-500 text-white dark:text-white hover:bg-warning-600", color: "bg-warning-500 dark:bg-warning-400", label: "Decision" },
  end: { button: "bg-error-500 text-white dark:text-white hover:bg-error-600", color: "bg-error-500 dark:bg-error-400", label: "End" }
};

const actionOptions = [
  { value: "create_case", label: "Create Case" },
  { value: "assign_case", label: "Assign Case" },
  { value: "investigate", label: "Investigate" },
  { value: "collect_evidence", label: "Collect Evidence" },
  { value: "review_case", label: "Review Case" },
  { value: "escalate", label: "Escalate Case" },
  { value: "approve", label: "Approve" },
  { value: "reject", label: "Reject" },
  { value: "resolve_case", label: "Resolve Case" },
  { value: "close_case", label: "Close Case" },
  { value: "reopen_case", label: "Reopen Case" },
  { value: "send_notification", label: "Send Notification" },
  { value: "schedule_hearing", label: "Schedule Hearing" },
  { value: "update_status", label: "Update Status" }
];

// const formOptions = [
//   { value: "case_intake", label: "Form - Case Intake" },
//   { value: "case_assignment", label: "Form - Case Assignment" },
//   { value: "investigation_report", label: "Form - Investigation Report" },
//   { value: "evidence_collection", label: "Form - Evidence Collection" },
//   { value: "case_review", label: "Form - Case Review" },
//   { value: "escalation_request", label: "Form - Escalation Request" },
//   { value: "approval_decision", label: "Form - Approval Decision" },
//   { value: "case_resolution", label: "Form - Case Resolution" },
//   { value: "case_closure", label: "Form - Case Closure" },
//   { value: "communication_log", label: "Form - Communication Log" },
//   { value: "hearing_schedule", label: "Form - Hearing Schedule" },
//   { value: "status_update", label: "Button - Status Update" },
//   { value: "notification", label: "Toast - Notification" },
//   { value: "document_upload", label: "File - Document Upload" }
// ];

const GroupOptions = [
  { value: "case_manager", label: "Case Manager" },
  { value: "investigator", label: "Investigator" },
  { value: "supervisor", label: "Supervisor" },
  { value: "legal_advisor", label: "Legal Advisor" },
  { value: "compliance_officer", label: "Compliance Officer" },
  { value: "senior_manager", label: "Senior Manager" },
  { value: "external_reviewer", label: "External Reviewer" },
  { value: "director", label: "Director" }
];

// Case Management System options
const casePriorityOptions = [
  { value: "low", label: "Low Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "high", label: "High Priority" },
  { value: "critical", label: "Critical Priority" },
  { value: "urgent", label: "Urgent Priority" }
];

const caseCategoryOptions = [
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "support", label: "Support Request" },
  { value: "maintenance", label: "Maintenance" },
  { value: "investigation", label: "Investigation" },
  { value: "incident", label: "Incident" },
  { value: "change_request", label: "Change Request" },
  { value: "consultation", label: "Consultation" },
  { value: "escalation", label: "Escalation" }
];

// const targetCaseStatusOptions = [
//   { value: "open", label: "Open" },
//   { value: "assigned", label: "Assigned" },
//   { value: "in_progress", label: "In Progress" },
//   { value: "under_review", label: "Under Review" },
//   { value: "escalated", label: "Escalated" },
//   { value: "pending_approval", label: "Pending Approval" },
//   { value: "resolved", label: "Resolved" },
//   { value: "closed", label: "Closed" },
//   { value: "suspended", label: "Suspended" },
//   { value: "reopened", label: "Reopened" }
// ];

const WorkflowEditorComponent: React.FC<WorkflowEditorComponentProps> = ({
  forms,
  initialData = {
    nodes: [],
    connections: [],
    metadata: {
      title: "Untitled Workflow",
      description: "",
      status: "draft",
      createdAt: new Date().toISOString(),
      casePriority: "",
      caseCategory: "",
      // targetCaseStatus: ""
    }
  },
  users,
  workflowId,
  onSave 
}) => {
  const permissions = usePermissions();

  const [nodes, setNodes] = useState<WorkflowNode[]>(initialData.nodes);
  const [connections, setConnections] = useState<Connection[]>(initialData.connections);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [tempConnection, setTempConnection] = useState<Position | null>(null);
  const [showJsonPreview, setShowJsonPreview] = useState<boolean>(false);
  const [workflowMetadata, setWorkflowMetadata] = useState(initialData.metadata);
  const [connectingFrom, setConnectingFrom] = useState<"yes" | "no" | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false);
  const [showComponentsPreview, setShowComponentsPreview] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>("");
  const [draggedNodeType, setDraggedNodeType] = useState<WorkflowNode["type"] | null>(null);
  // Enhanced state for Components Preview
  const [decisionSelections, setDecisionSelections] = useState<Record<string, "yes" | "no">>({});
  // const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedTagsGroup, setSelectedTagsGroup] = useState<string[]>([]);
  const [selectedTagsUser, setSelectedTagsUser] = useState<string[]>([]);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formOptions = forms?.map((form) => {
    return { value: form?.formId || "", label: form?.formName || "" };
  }) || [];

  const userOptions = users?.map((user) => {
    return { value: user?.username || "", label: user?.displayName || user?.username || "" };
  }) || [];

  // Prepare workflow status options for Select component
  const workflowStatusesOptions = workflowStatuses.map(status => ({
    value: status.value,
    label: status.label
  }));

  // Load workflow data from URL if workflowId is provided
  useEffect(() => {
    if (workflowId && workflowId !== "new") {
      // Mock API call - replace with actual API
      const loadWorkflowFromUrl = async () => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 100));
          
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
            nodes.map((n) => ({
              ...n,
              type: n.type as WorkflowNode["type"],
            }))
          );
          setConnections(connections);
          setWorkflowMetadata({
            ...metadata,
            status: metadata.status as WorkflowData["metadata"]["status"],
          });
        }
        catch (error) {
          console.error("Failed to load workflow:", error);
        }
      };
      
      loadWorkflowFromUrl();
    }

    console.log(workflowId);
  }, [workflowId]);

  // Validate workflow before saving
  const validateWorkflow = useCallback((): string[] => {
    const errors: string[] = [];
    
    const hasStartNode = nodes.some(node => node.type === "start");
    const hasEndNode = nodes.some(node => node.type === "end");
    
    if (!hasStartNode) {
      errors.push("Workflow must have at least one Start node");
    }
    
    if (!hasEndNode) {
      errors.push("Workflow must have at least one End node");
    }
    
    // Validate connection limits
    const connectionCounts = nodes.reduce((acc, node) => {
      const outgoingConnections = connections.filter(conn => conn.source === node.id);
      acc[node.id] = outgoingConnections.length;
      return acc;
    }, {} as Record<string, number>);
    
    nodes.forEach(node => {
      const count = connectionCounts[node.id] || 0;
      if ((node.type === "start" || node.type === "process" || node.type === "end") && count > 1) {
        errors.push(`${node.data.label} can only have 1 outgoing connection`);
      }
      if (node.type === "decision" && count > 2) {
        errors.push(`${node.data.label} can only have 2 outgoing connections (Yes/No)`);
      }
    });
    
    return errors;
  }, [nodes, connections]);

  // Snap position to grid
  const snapToGrid = useCallback((position: Position): Position => {
    return {
      x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(position.y / GRID_SIZE) * GRID_SIZE
    };
  }, []);

  // Calculate connection point on node border
  const getNodeConnectionPoint = useCallback((fromPos: Position, toPos: Position, isSource: boolean): Position => {
    const nodeCenter = {
      x: (isSource ? fromPos.x : toPos.x) + NODE_WIDTH / 2,
      y: (isSource ? fromPos.y : toPos.y) + NODE_HEIGHT / 2
    };
    
    const otherCenter = {
      x: (isSource ? toPos.x : fromPos.x) + NODE_WIDTH / 2,
      y: (isSource ? toPos.y : fromPos.y) + NODE_HEIGHT / 2
    };

    // Calculate which side to connect from/to
    const dx = otherCenter.x - nodeCenter.x;
    const dy = otherCenter.y - nodeCenter.y;
    
    const nodeHalfWidth = NODE_WIDTH / 2;
    const nodeHalfHeight = NODE_HEIGHT / 2;
    
    // Determine connection side based on direction
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal connection (left/right)
      return {
        x: nodeCenter.x + (dx > 0 ? nodeHalfWidth : -nodeHalfWidth),
        y: nodeCenter.y
      };
    }
    else {
      // Vertical connection (top/bottom)
      return {
        x: nodeCenter.x,
        y: nodeCenter.y + (dy > 0 ? nodeHalfHeight : -nodeHalfHeight)
      };
    }
  }, []);

  // Enhanced path traversal for Components Preview
  const getWorkflowPath = useCallback((startNodeId: string, decisions: Record<string, "yes" | "no">): string[] => {
    const path: string[] = [];
    const visited = new Set<string>();
    
    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) {
        return;
      }
      visited.add(nodeId);
      
      const node = nodes.find(n => n.id === nodeId);
      if (!node) {
        return;
      }
      
      path.push(nodeId);
      
      if (node.type === "end") {
        return;
      }
      
      const outgoingConnections = connections.filter(c => c.source === nodeId);
      
      if (node.type === "decision") {
        const selectedPath = decisions[nodeId] || "yes"; // Default to yes
        const connection = outgoingConnections.find(c => c.label === selectedPath);
        if (connection) {
          traverse(connection.target);
        }
      } else {
        // For non-decision nodes, follow the first connection
        if (outgoingConnections.length > 0) {
          traverse(outgoingConnections[0].target);
        }
      }
    };
    
    traverse(startNodeId);
    return path;
  }, [nodes, connections]);

  // Get form component configuration
  const getFormComponentConfig = useCallback((formType: string) => {
    interface FormFieldConfig {
      name: string;
      type: string;
      label: string;
      required?: boolean;
      options?: string[];
    }

    interface FormConfig {
      fields: FormFieldConfig[];
    }

    // const formConfigs: Record<string, FormConfig> = workflowForm;
    const formConfigs: Record<string, FormConfig> = workflowFormV02;
    
    return formConfigs[formType] || { fields: [] };
  }, []);

  // Generate components preview based on workflow path
  const generateComponentsPreview = useCallback(() => {
    const startNodes = nodes.filter(n => n.type === "start");
    if (startNodes.length === 0) {
      return [];
    }

    const pathNodes = getWorkflowPath(startNodes[0].id, decisionSelections);

    type PreviewComponent =
      | {
          id: string;
          type: "start";
          label: string;
          description?: string;
          continueFromWorkflow?: boolean;
          sourceWorkflowId?: string;
        }

      | {
          id: string;
          type: "form";
          label: string;
          form: string;
          formConfig: ReturnType<typeof getFormComponentConfig>;
          sla?: string | number;
          pic?: string;
        }
      | {
          id: string;
          type: "decision";
          label: string;
          condition?: string;
        }
      | {
          id: string;
          type: "end";
          label: string;
          description?: string;
          allowContinuation?: boolean;
          nextWorkflowId?: string;
        };

    const components: PreviewComponent[] = [];

    pathNodes.forEach(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) {
        return;
      }

      if (node.type === "start") {
        components.push({
          id: node.id,
          type: "start",
          label: node.data.label,
          description: node.data.description,
          continueFromWorkflow: node.data.config?.continueFromWorkflow === true,
          sourceWorkflowId: typeof node.data.config?.sourceWorkflowId === "string" ? node.data.config.sourceWorkflowId : undefined
        });
      }
      else if (node.type === "process" && node.data.config?.form) {
        const formConfig = getFormComponentConfig(
          typeof node.data.config?.form === "string" ? node.data.config.form : ""
        );
        components.push({
          id: node.id,
          type: "form",
          label: node.data.label,
          form: typeof node.data.config?.form === "string" ? node.data.config.form : "",
          formConfig,
          sla: typeof node.data.config?.sla === "string" || typeof node.data.config?.sla === "number" ? node.data.config.sla : undefined,
          pic: typeof node.data.config?.pic === "string" ? node.data.config.pic : undefined
        });
      }
      else if (node.type === "decision") {
        components.push({
          id: node.id,
          type: "decision",
          label: node.data.label,
          condition: typeof node.data.config?.condition === "string" ? node.data.config.condition : undefined
        });
      }
      else if (node.type === "end") {
        components.push({
          id: node.id,
          type: "end",
          label: node.data.label,
          description: node.data.description,
          allowContinuation: node.data.config?.allowContinuation === true,
          nextWorkflowId: typeof node.data.config?.nextWorkflowId === "string" ? node.data.config.nextWorkflowId : undefined
        });
      }
    });
    
    return components;
  }, [
    nodes,
    decisionSelections,
    getWorkflowPath,
    getFormComponentConfig
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
      const existingPositions = nodes.map(n => n.position);

      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 8; col++) {
          const testPosition = {
            x: baseX + col * (NODE_WIDTH + GRID_SIZE),
            y: baseY + row * (NODE_HEIGHT + GRID_SIZE)
          };
          
          const isOccupied = existingPositions.some(pos => 
            Math.abs(pos.x - testPosition.x) < NODE_WIDTH && 
            Math.abs(pos.y - testPosition.y) < NODE_HEIGHT
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

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      position: nodePosition,
      data: {
        label: `${nodeTypes[type].label} ${nodes.filter(n => n.type === type).length + 1}`,
        description: "",
        config: initialConfig
      }
    };
    
    setNodes(prev => [...prev, newNode]);
    // Automatically select the newly added node
    setSelectedNode(newNode);
    
    return newNode;
  }, [nodes, snapToGrid]);

  // Handle drag start from node palette
  const handleDragStart = useCallback((e: React.DragEvent, nodeType: WorkflowNode["type"]) => {
    setDraggedNodeType(nodeType);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", nodeType);
  }, []);

  // Handle drag over canvas
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, [

  ]);

  // Handle drop on canvas
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (draggedNodeType) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const position = snapToGrid({
          x: e.clientX - rect.left - NODE_WIDTH / 2,
          y: e.clientY - rect.top - NODE_HEIGHT / 2
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
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Only clear preview if actually leaving the canvas area
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        // Handle drag leave
      }
    }
  }, []);

  // Handle mouse down on node
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      return;
    }

    if (e.shiftKey && permissions.hasAnyPermission(["workflow.create", "workflow.update"])) {
      // Shift + click to start connection

      // Check connection limits
      const outgoingConnections = connections.filter(conn => conn.source === nodeId);
      const maxConnections = node.type === "decision" ? 2 : 1;
      
      if (outgoingConnections.length >= maxConnections) {
        alert(`${node.type === "decision" ? "Decision" : "This"} node already has maximum connections`);
        return;
      }
      
      // For decision nodes, determine Yes/No connection
      if (node.type === "decision") {
        const hasYes = outgoingConnections.some(conn => conn.label === "yes");
        const hasNo = outgoingConnections.some(conn => conn.label === "no");
        
        if (!hasYes) {
          setConnectingFrom("yes");
        }
        else if (!hasNo) {
          setConnectingFrom("no");
        }
        else {
          alert("Decision node already has both Yes and No connections");
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
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect && permissions.hasAnyPermission(["workflow.create", "workflow.update"])) {
        setIsDragging(nodeId);
        setDragOffset({
          x: e.clientX - rect.left - node.position.x,
          y: e.clientY - rect.top - node.position.y
        });
      }
    }
    setSelectedNode(node);
  }, [
    nodes,
    connections,
    permissions
  ]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    if (isDragging) {
      const newPosition = snapToGrid({
        x: mousePos.x - dragOffset.x,
        y: mousePos.y - dragOffset.y
      });

      setNodes(prev => prev.map(node => 
        node.id === isDragging
          ? { ...node, position: newPosition }
          : node
      ));
    }
    else if (isConnecting) {
      setTempConnection(snapToGrid(mousePos));
    }
  }, [
    isDragging,
    isConnecting,
    dragOffset,
    snapToGrid
  ]);

  // Handle mouse up
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isConnecting) {
      // Check if we"re over a node
      const target = e.target as Element;
      const nodeElement = target.closest("[data-node-id]");
      if (nodeElement) {
        const targetNodeId = nodeElement.getAttribute("data-node-id");
        if (targetNodeId && targetNodeId !== isConnecting) {
          // Validate connection
          const targetNode = nodes.find(n => n.id === targetNodeId);
          const sourceNode = nodes.find(n => n.id === isConnecting);
          
          if (targetNode && sourceNode) {
            // Check if target can accept connections (start nodes cannot be targets)
            if (targetNode.type === "start") {
              alert("Cannot connect to Start node");
              setIsConnecting(null);
              setConnectingFrom(null);
              setTempConnection(null);
              return;
            }
            
            // Check for duplicate connections
            const existingConnection = connections.find(conn => 
              conn.source === isConnecting && conn.target === targetNodeId
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
    isConnecting,
    connectingFrom,
    nodes,
    connections
  ]);

  // Delete node
  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.source !== nodeId && c.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  // Update node data
  const updateNodeData = useCallback((nodeId: string, updates: Partial<WorkflowNode["data"]>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...updates } }
        : node
    ));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, ...updates } } : null);
    }
  }, [selectedNode]);

  const updateNodeDataMultiple = (key: string, values: string[]) => {
    if (selectedNode) {
      switch (key) {
        case "group":
          setSelectedTagsGroup(values);
          break;
        case "pic":
          setSelectedTagsUser(values);
          break;
        default:
          break;
      }
      updateNodeData(selectedNode.id, { config: { ...selectedNode.data.config, [key]: values } });
    }
  }

  // Import JSON workflow
  const importJsonWorkflow = useCallback(() => {
    try {
      const workflowData = JSON.parse(importJsonText);
      
      // Validate imported data structure
      if (!workflowData.nodes || !workflowData.connections || !workflowData.metadata) {
        throw new Error("Invalid workflow format");
      }
      
      setNodes(workflowData.nodes);
      setConnections(workflowData.connections);
      setWorkflowMetadata(workflowData.metadata);
      setImportJsonText("");
      setShowImportDialog(false);
      
      console.log("Workflow imported successfully");
    }
    catch (error) {
      alert("Invalid JSON format. Please check your input.");
      console.error("Import error:", error);
    }
  }, [importJsonText]);

  // Import from file
  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
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
    a.download = `${workflowMetadata.title.replace(/\s+/g, "_").toLowerCase()}_workflow.json`;
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
  const saveWorkflow = useCallback(() => {
    const errors = validateWorkflow();
    setValidationErrors(errors);

    if (errors.length > 0) {
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
    console.log("Workflow saved:", workflowData);
  }, [
    nodes,
    connections,
    workflowMetadata,
    onSave,
    validateWorkflow
  ]);

  // Update workflow metadata
  const updateWorkflowMetadata = useCallback((updates: Partial<typeof workflowMetadata>) => {
    setWorkflowMetadata(prev => ({ ...prev, ...updates }));
  }, []);

  // Show JSON preview before save
  const handleSaveClick = useCallback(() => {
    const errors = validateWorkflow();
    setValidationErrors(errors);
    setShowJsonPreview(true);
  }, [
    validateWorkflow,
  ]);

  // Get node position by ID
  const getNodePosition = useCallback((nodeId: string): Position => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.position : { x: 0, y: 0 };
  }, [nodes]);

  return (
    <>
      <div
        className="xl:flex bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-700"
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileImport}
          className="hidden"
        />

        {/* Toolbar */}
        <div
          className="xl:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 rounded-l-2xl rounded-r-2xl xl:rounded-r-none"
        >
          {/* Workflow Metadata */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 cursor-default">
              Workflow Details
            </h3>
            
            {/* Title Input */}
            <div className="mb-3">
              <label htmlFor="workflowMetadata.title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Title
              </label>
              {permissions.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                <Input
                  type="text"
                  id="workflowMetadata.title"
                  value={workflowMetadata.title}
                  onChange={(e) => updateWorkflowMetadata({ title: e.target.value })}
                  placeholder="Enter workflow title..."
                />
              : <div
                  className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default"
                >
                  {workflowMetadata.title || "Untitled Workflow"}
                </div>
              }
            </div>

            {/* Description Input */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Description
              </label>
              {permissions.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                <TextArea
                  value={workflowMetadata.description}
                  onChange={(value) => updateWorkflowMetadata({ description: value })}
                  rows={2}
                  placeholder="Brief description..."
                />
              : <div
                  className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default"
                >
                  {workflowMetadata.description || "-"}
                </div>
              }
            </div>

            {/* Status Selector */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                Status
              </label>
              {permissions.hasAnyPermission(["workflow.create", "workflow.update"]) && (
                <Select
                  value={workflowMetadata.status}
                  onChange={(value) => updateWorkflowMetadata({ status: (value as WorkflowData["metadata"]["status"]) })}
                  options={workflowStatusesOptions}
                  placeholder="Select Status"
                  className="cursor-pointer"
                />
              )}
            </div>

            {/* Status Badge */}
            {!permissions.hasAnyPermission(["workflow.create", "workflow.update"]) && (
              <div className="flex items-center gap-2 cursor-default">
                <span className="text-xs text-gray-500 dark:text-gray-400">Current Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  workflowStatuses.find(s => s.value === workflowMetadata.status)?.color || "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800"
                }`}>
                  {workflowStatuses.find(s => s.value === workflowMetadata.status)?.label}
                </span>
              </div>
            )}
          </div>

          <PermissionGate permissions={["workflow.create", "workflow.update"]}>
            {/* Node Types */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 cursor-default">Add Nodes</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(nodeTypes).map(([type, config]) => {
                  return (
                    <div
                      key={type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, type as WorkflowNode["type"])}
                      onClick={() => addNode(type as WorkflowNode["type"])}
                      // className={`flex items-center gap-2 p-2 border rounded-lg transition-colors cursor-grab active:cursor-grabbing select-none ${config.button}`}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-colors cursor-grab active:cursor-grabbing select-none ${config.button}`}
                      title={`Click to add or drag to canvas: ${config.label}`}
                    >
                      <span className="text-xs text-center w-100">{config.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </PermissionGate>

          {/* Case Management System Settings */}
          <div
            // className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-4"
            className="mb-4 border-t border-gray-200 dark:border-gray-700"
          >
            {/*
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 cursor-default">
              SOP Settings
            </h3>
            */}
            
            {/*
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Case Priority
              </label>
              <Select
                value={workflowMetadata.casePriority || ""}
                onChange={(value) => updateWorkflowMetadata({ casePriority: value })}
                options={casePriorityOptions}
                placeholder="Select Priority"
                className="cursor-pointer"
              />
            </div>
            */}

            {/*
            <PermissionGate permissions={["workflow.create", "workflow.update"]}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Case Type
                </label>
                <Select
                  value={workflowMetadata.caseCategory || ""}
                  onChange={(value) => updateWorkflowMetadata({ caseCategory: value })}
                  options={caseCategoryOptions}
                  // placeholder="Select Category"
                  placeholder="Select Case Type"
                  disabled={workflowId && workflowId !== "new" ? true : false}
                  className="cursor-pointer"
                />
              </div>
            </PermissionGate>
            */}

            {/*
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Target Case Status
              </label>
              <Select
                value={workflowMetadata.targetCaseStatus || ""}
                onChange={(value) => updateWorkflowMetadata({ targetCaseStatus: value })}
                options={targetCaseStatusOptions}
                placeholder="Select Target Status"
                className="cursor-pointer"
              />
            </div>
            */}

            {/* Case Management Summary */}
            {/*
            <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg border border-blue-200 dark:border-blue-800 cursor-default">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-100 mb-2">
                SOP Summary
              </h4>
              <div className="text-xs text-blue-700 dark:text-blue-200 space-y-1">
                <div>
                  Priority: <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    workflowMetadata.casePriority === "urgent" || workflowMetadata.casePriority === "critical" 
                      ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                      : workflowMetadata.casePriority === "high"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                      : workflowMetadata.casePriority === "medium"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                      : workflowMetadata.casePriority === "low"
                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                  }`}>
                    {casePriorityOptions.find(p => p.value === workflowMetadata.casePriority)?.label || "Not Set"}
                  </span>
                </div>
                <div>
                  Case Type: <strong>{caseCategoryOptions.find(c => c.value === workflowMetadata.caseCategory)?.label || "Not Set"}</strong>
                </div>
                <div>
                  Target Status: <strong>{targetCaseStatusOptions.find(s => s.value === workflowMetadata.targetCaseStatus)?.label || "Not Set"}</strong>
                </div>
              </div>
            </div>
            */}
          </div>

          <PermissionGate permissions={["workflow.create", "workflow.update"]}>
            {/* Actions */}
            <div className="mb-2">
              <Button
                onClick={() => setShowImportDialog(true)}
                className="w-full mb-2"
                variant="success"
              >
                <FileIcon className="w-4 h-4" />
                Import JSON
              </Button>
              <Button
                onClick={() => setShowComponentsPreview(true)}
                className="w-full mb-2"
                variant="info"
              >
                <BoxCubeIcon className="w-4 h-4" />
                {/* Components Preview */}
                SOP Preview
              </Button>
              <Button
                onClick={handleSaveClick}
                className="w-full mb-2"
                variant="primary"
              >
                <DownloadIcon className="w-4 h-4" />
                Save Workflow
              </Button>
            </div>

            {/* Instructions */}
            <div className="text-xs text-gray-500 dark:text-gray-400 cursor-default">
              <p className="text-gray-600 dark:text-gray-300">
                {/* <strong>Case Management:</strong> */}
                <strong>SOP Management:</strong>
              </p>
              {/* <p>• Set case priority, category, and target status</p> */}
              {/* <p>• Set case priority, and category</p> */}
              {/* <p>• Set case priority, type, and target status</p> */}
              <p>• Visual priority indicators in summary panel</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Node Operations:</strong></p>
              <p>• Click nodes to add at top-left of visible canvas</p>
              <p>• Drag nodes from palette to canvas</p>
              <p>• Click to select nodes</p>
              <p>• Drag to move nodes (snaps to grid)</p>
              <p>• Shift+click to connect nodes</p>
              <p>• Decision nodes have Yes/No connectors</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Workflow Features:</strong></p>
              {/* <p>• Start nodes can continue from other workflows</p> */}
              {/* <p>• End nodes can allow workflow continuation</p> */}
              {/*
              <p>• Visual indicators:
                <AngleLeftIcon className="mx-1 inline w-3 h-3 bg-blue-400 border border-blue-600 rounded-full items-center justify-center" /> (continues from),
                <AngleRightIcon className="mx-1 inline w-3 h-3 bg-green-400 border border-green-600 rounded-full items-center justify-center" /> (allows continuation)
              </p>
              */}
              <p>• Start/End nodes required for save</p>
              <p>• Max connections: 1 (normal), 2 (decision)</p>
              <p>• Import/Export JSON workflows</p>
              <p>• Preview form components</p>
              <p>• Scroll for large workflows</p>
            </div>
          </PermissionGate>
        </div>

        {/* Canvas */}
        <div
          className="xl:flex-1 relative xl:overflow-x-auto xl:overflow-y-auto"
        >
          <div
            ref={canvasRef}
            className={`min-w-full min-h-full relative 
              ${permissions.hasAnyPermission(["workflow.create", "workflow.update"]) ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`
            }
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
          >
            <svg
              ref={svgRef}
              className="xl:absolute inset-0 pointer-events-none"
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
              {connections.map(connection => {
                const sourcePos = getNodePosition(connection.source);
                const targetPos = getNodePosition(connection.target);
                const sourcePoint = getNodeConnectionPoint(sourcePos, targetPos, true);
                const targetPoint = getNodeConnectionPoint(sourcePos, targetPos, false);
                
                // Determine if connection is vertical (straight line) or horizontal (curve)
                const isVertical = Math.abs(sourcePoint.x - targetPoint.x) < 10;
                
                let pathD;
                if (isVertical) {
                  // Straight line for vertical connections
                  pathD = `M ${sourcePoint.x},${sourcePoint.y} L ${targetPoint.x},${targetPoint.y}`;
                }
                else {
                  // Curved line for horizontal connections
                  const midX = (sourcePoint.x + targetPoint.x) / 2;
                  pathD = `M ${sourcePoint.x},${sourcePoint.y} C ${midX},${sourcePoint.y} ${midX},${targetPoint.y} ${targetPoint.x},${targetPoint.y}`;
                }
                
                // Calculate label position
                const labelX = (sourcePoint.x + targetPoint.x) / 2;
                const labelY = (sourcePoint.y + targetPoint.y) / 2;
                
                return (
                  <g key={connection.id}>
                    <path
                      d={pathD}
                      // stroke="#6b7280"
                      stroke="#cccccc"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />

                    {connection.label && (
                      <g>
                        <circle
                          cx={labelX}
                          cy={labelY}
                          r="12"
                          fill="white"
                          stroke="#6b7280"
                          strokeWidth="1"
                        />

                        <text
                          x={labelX}
                          y={labelY}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="10"
                          fill="#374151"
                          fontWeight="bold"
                        >
                          {connection.label === "yes" ? "Y" : "N"}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Temporary connection while dragging */}
              {isConnecting && tempConnection && (
                <g>
                  <path
                    d={`M ${getNodeConnectionPoint(getNodePosition(isConnecting), tempConnection, true).x},${getNodeConnectionPoint(getNodePosition(isConnecting), tempConnection, true).y} L ${tempConnection.x},${tempConnection.y}`}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    fill="none"
                  />

                  {connectingFrom && (
                    <text
                      x={tempConnection.x + 10}
                      y={tempConnection.y - 10}
                      fontSize="12"
                      fill="#3b82f6"
                      fontWeight="bold"
                    >
                      {connectingFrom.toUpperCase()}
                    </text>
                  )}
                </g>
              )}

              {/* Arrow marker */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="10"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#6b7280"
                  />
                </marker>
              </defs>
            </svg>

            {/* Nodes */}
            {nodes.map(node => {
              const nodeConfig = nodeTypes[node.type];
              const isSelected = selectedNode?.id === node.id;
              const isContinueFromWorkflow = node.type === "start" && node.data.config?.continueFromWorkflow;
              const isAllowContinuation = node.type === "end" && node.data.config?.allowContinuation;
              
              return (
                <div
                  key={node.id}
                  data-node-id={node.id}
                  className={`absolute pointer-events-auto select-none transition-all rounded-lg ${
                    isSelected ? "ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-0" : ""
                  } ${permissions.hasAnyPermission(["workflow.create", "workflow.update"]) ? (isDragging === node.id ? "cursor-grabbing" : "cursor-grab") : "cursor-default"}`}
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    zIndex: 2
                  }}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                >
                  {node.type === "decision" ? (
                    // Diamond shape for decision nodes
                    <div className="relative w-24 h-16 flex items-center justify-center">
                      <svg width="96" height="64" className="absolute inset-0">
                        <polygon
                          points="48,4 88,32 48,60 8,32"
                          fill="rgb(234 179 8)"
                          stroke="white"
                          strokeWidth="2"
                          className="drop-shadow-lg"
                        />
                      </svg>
                      <div className="relative z-10 flex flex-col items-center justify-center text-white dark:text-gray-900">
                        <span className="text-xs font-medium truncate px-1 max-w-16 text-center">{node.data.label}</span>
                      </div>
                    </div>
                  ) : (
                    // Rectangle shape for other nodes
                    <div className={`w-24 h-16 rounded-lg border-2 border-white dark:border-gray-900 shadow-lg flex flex-col items-center justify-center text-white dark:text-gray-900 ${nodeConfig.color}`}>
                      <span className="text-xs font-medium truncate px-1">{node.data.label}</span>

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
                  
                  {isSelected && permissions.hasAnyPermission(["workflow.create", "workflow.update"]) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.id);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 border border-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <TrashBinIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Configuration Panel */}
        <div
          className="xl:w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 rounded-r-2xl rounded-l-2xl xl:rounded-l-none"
        >
          <div className="flex items-center gap-2 mb-2">
            <PencilIcon className="w-5 h-5 text-lg font-semibold text-gray-700 dark:text-gray-200" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 cursor-default">
              Node Configuration
            </h3>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="cursor-default mb-2">
              <Alert
                variant="error"
                title="Validation Errors"
                messages={validationErrors}
                showLink={false}
              />
            </div>
          )}

          {selectedNode ? (
            <div className="space-y-2">
              <div>
                <label htmlFor="selectedNode.data.label" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Label
                </label>
                {permissions.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                  <Input
                    type="text"
                    id="selectedNode.data.label"
                    value={selectedNode.data.label}
                    onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                  />
                : <div
                    className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default"
                  >
                    {selectedNode.data.label || "-"}
                  </div>
                }
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Description
                </label>
                {permissions.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                  <TextArea
                    value={selectedNode.data.description || ""}
                    onChange={(value) => updateNodeData(selectedNode.id, { description: value })}
                    rows={1}
                    placeholder="Enter description..."
                  />
                : <div
                    className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default"
                  >
                    {selectedNode.data.description || "-"}
                  </div>
                }
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Node Type
                </label>
                <div className="flex items-center gap-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{nodeTypes[selectedNode.type].label}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Position
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="selectedNode.position.x" className="block text-xs text-gray-500 dark:text-gray-400">X</label>
                    {permissions.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                      <Input
                        type="number"
                        id="selectedNode.position.x"
                        value={Math.round(selectedNode.position.x)}
                        onChange={(e) => {
                          const newPosition = snapToGrid({ 
                            x: parseInt(e.target.value) || 0, 
                            y: selectedNode.position.y 
                          });
                          const newNodes = nodes.map(n => 
                            n.id === selectedNode.id 
                              ? { ...n, position: newPosition }
                              : n
                          );
                          setNodes(newNodes);
                          setSelectedNode({ ...selectedNode, position: newPosition });
                        }}
                        step={GRID_SIZE}
                      />
                    : <div
                        className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default"
                      >
                        {Math.round(selectedNode.position.x) || 0}
                      </div>
                    }
                  </div>

                  <div>
                    <label htmlFor="selectedNode.position.y" className="block text-xs text-gray-500 dark:text-gray-400">Y</label>
                    {permissions.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                      <Input
                        type="number"
                        id="selectedNode.position.y"
                        value={Math.round(selectedNode.position.y)}
                        onChange={(e) => {
                          const newPosition = snapToGrid({ 
                            x: selectedNode.position.x, 
                            y: parseInt(e.target.value) || 0 
                          });
                          const newNodes = nodes.map(n => 
                            n.id === selectedNode.id 
                              ? { ...n, position: newPosition }
                              : n
                          );
                          setNodes(newNodes);
                          setSelectedNode({ ...selectedNode, position: newPosition });
                        }}
                        step={GRID_SIZE}
                      />
                    : <div
                        className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default"
                      >
                        {Math.round(selectedNode.position.y) || 0}
                      </div>
                    }
                  </div>
                </div>
              </div>

              {/* Type-specific configuration */}
              {/*
              {selectedNode.type === "start" && (
                <>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      <input
                        type="checkbox"
                        checked={selectedNode.data.config?.continueFromWorkflow === true}
                        onChange={(e) => updateNodeData(selectedNode.id, { 
                          config: { 
                            ...selectedNode.data.config, 
                            continueFromWorkflow: e.target.checked,
                            sourceWorkflowId: e.target.checked ? (selectedNode.data.config?.sourceWorkflowId || "") : ""
                          }
                        })}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-300 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      Continue from another workflow
                    </label>
                  </div>
                  
                  {selectedNode.data.config?.continueFromWorkflow && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Source Workflow ID
                      </label>
                      <Input
                        type="text"
                        value={typeof selectedNode.data.config?.sourceWorkflowId === "string" ? selectedNode.data.config.sourceWorkflowId : ""}
                        onChange={(e) => updateNodeData(selectedNode.id, { 
                          config: { ...selectedNode.data.config, sourceWorkflowId: e.target.value }
                        })}
                        placeholder="Enter source workflow ID..."
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        ID of the workflow that this workflow continues from
                      </p>
                    </div>
                  )}
                </>
              )}

              {selectedNode.type === "end" && (
                <>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      <input
                        type="checkbox"
                        checked={selectedNode.data.config?.allowContinuation === true}
                        onChange={(e) => updateNodeData(selectedNode.id, { 
                          config: { 
                            ...selectedNode.data.config, 
                            allowContinuation: e.target.checked,
                            nextWorkflowId: e.target.checked ? (selectedNode.data.config?.nextWorkflowId || "") : ""
                          }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Allow other workflows to continue
                    </label>
                  </div>
                  
                  {selectedNode.data.config?.allowContinuation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Next Workflow ID
                      </label>
                      <Input
                        type="text"
                        value={typeof selectedNode.data.config?.nextWorkflowId === "string" ? selectedNode.data.config.nextWorkflowId : ""}
                        onChange={(e) => updateNodeData(selectedNode.id, { 
                          config: { ...selectedNode.data.config, nextWorkflowId: e.target.value }
                        })}
                        placeholder="Enter next workflow ID..."
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        ID of the workflow that should continue after this one
                      </p>
                    </div>
                  )}
                </>
              )}
              */}

              {/* Type-specific configuration */}
              {selectedNode.type === "decision" && (
                <div>
                  <label htmlFor="selectedNode.data.config.condition" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Condition
                  </label>
                  {permissions.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                    <Input
                      type="text"
                      id="selectedNode.data.config.condition"
                      value={typeof selectedNode.data.config?.condition === "string" ? selectedNode.data.config.condition : ""}
                      onChange={(e) => updateNodeData(selectedNode.id, { 
                        config: { ...(selectedNode.data.config ?? {}), condition: e.target.value }
                      })}
                      placeholder="Enter condition..."
                    />
                  : <div
                      className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default"
                    >
                      {typeof selectedNode.data.config?.condition === "string" ? selectedNode.data.config.condition : ""}
                    </div>
                  }
                </div>
              )}

              {selectedNode.type === "process" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Action
                    </label>
                    {permissions.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                      <Select
                        value={typeof selectedNode.data.config?.action === "string" ? selectedNode.data.config.action : ""}
                        onChange={(value) => updateNodeData(selectedNode.id, {
                          config: { ...selectedNode.data.config, action: value }
                        })}
                        options={actionOptions}
                        placeholder="Select Action"
                        className="bg-white dark:bg-gray-900 cursor-pointer"
                      />
                    : <div
                        className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default"
                      >
                        {actionOptions.find(a => a.value === selectedNode.data.config?.action)?.label || ""}
                      </div>
                    }
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Form
                    </label>
                    {permissions.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                      <Select
                        value={typeof selectedNode.data.config?.formId === "string" ? selectedNode.data.config.formId : ""}
                        onChange={(value) => updateNodeData(selectedNode.id, { 
                          config: { ...selectedNode.data.config, formId: value }
                        })}
                        options={formOptions}
                        placeholder="Select Form"
                        className="bg-white dark:bg-gray-900 cursor-pointer"
                      />
                    : <div
                        className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default"
                      >
                        {formOptions.find(f => f.value === selectedNode.data.config?.formId)?.label || ""}
                      </div>
                    }
                  </div>

                  <div>
                    <label htmlFor="selectedNode.data.config.sla" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      {/* SLA (Hours) */}
                      SLA (Minutes)
                    </label>
                    {permissions.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                      <Input
                        type="number"
                        id="selectedNode.data.config.sla"
                        value={typeof selectedNode.data.config?.sla === "string" || typeof selectedNode.data.config?.sla === "number" ? selectedNode.data.config.sla : ""}
                        onChange={(e) => updateNodeData(selectedNode.id, { 
                          config: { ...selectedNode.data.config, sla: e.target.value }
                        })}
                        // placeholder="Enter SLA in hours..."
                        placeholder="Enter SLA in minutes..."
                        min="1"
                        max="720"
                      />
                    : <div
                        className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default"
                      >
                        {typeof selectedNode.data.config?.sla === "string" || typeof selectedNode.data.config?.sla === "number" ? selectedNode.data.config.sla : ""}
                      </div>
                    }
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Group of Assignee
                    </label>
                    {permissions.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                      // <Select
                      //   value={typeof selectedNode.data.config?.group === "string" ? selectedNode.data.config.group : ""}
                      //   onChange={(value) => updateNodeData(selectedNode.id, { 
                      //     config: { ...selectedNode.data.config, group: value }
                      //   })}
                      //   options={GroupOptions}
                      //   placeholder="Select Group"
                      //   className="bg-white dark:bg-gray-900 cursor-pointer"
                      // />
                      <CustomizableSelect
                        options={GroupOptions}
                        value={selectedTagsGroup}
                        // onChange={setSelectedTagsGroup}
                        onChange={(values) => updateNodeDataMultiple("group", values as string[])}
                        placeholder="Select Groups"
                        // asyncFetch={async (query, page) => {
                        //   const res = await fetch(`/api/tags?q=${query}&page=${page}`);
                        //   return res.json();
                        // }}
                      />
                    : <div
                        className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default"
                      >
                        {GroupOptions.find(g => g.value === selectedNode.data.config?.group)?.label || ""}
                      </div>
                    }
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      PIC (Person in Charge)
                    </label>
                    {permissions.hasAnyPermission(["workflow.create", "workflow.update"]) ?
                      // <Input
                      //   type="text"
                      //   value={typeof selectedNode.data.config?.pic === "string" || typeof selectedNode.data.config?.pic === "number" ? selectedNode.data.config.pic : ""}
                      //   onChange={(e) => updateNodeData(selectedNode.id, { 
                      //     config: { ...selectedNode.data.config, pic: e.target.value }
                      //   })}
                      //   placeholder="Enter PIC..."
                      // />
                      <CustomizableSelect
                        options={userOptions}
                        value={selectedTagsUser}
                        // onChange={setSelectedTagsUser}
                        onChange={(values) => updateNodeDataMultiple("pic", values as string[])}
                        placeholder="Select Users"
                        // asyncFetch={async (query, page) => {
                        //   const res = await fetch(`/api/tags?q=${query}&page=${page}`);
                        //   return res.json();
                        // }}
                      />
                    : <div
                        className="h-11 w-full rounded-lg appearance-none py-2.5 text-sm bg-transparent text-gray-800 dark:text-gray-100 cursor-default"
                      >
                        {typeof selectedNode.data.config?.pic === "string" ? selectedNode.data.config.pic : ""}
                      </div>
                    }
                  </div>
                </>
              )}

              {/* Connection Info */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 cursor-default">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Connections</h4>
                <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <div>
                    Outgoing: {connections.filter(c => c.source === selectedNode.id).length}
                    {selectedNode.type === "decision" && " / 2 (Yes/No)"}
                    {selectedNode.type !== "decision" && " / 1"}
                  </div>
                  <div>Incoming: {connections.filter(c => c.target === selectedNode.id).length}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-600 dark:text-gray-300 py-8 cursor-default">
              <PencilIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Select a node to configure its properties</p>
            </div>
          )}

          {/* Workflow Stats */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 cursor-default">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Workflow Stats</h4>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <div>Title: <span className="font-medium">{workflowMetadata.title}</span></div>
              <div>Status: <span className={`px-1 py-0.5 rounded text-xs ${
                  workflowStatuses.find(s => s.value === workflowMetadata.status)?.color || "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-900"
                }`}>
                  {workflowStatuses.find(s => s.value === workflowMetadata.status)?.label}
                </span>
              </div>
              <div>Nodes: {nodes.length}</div>
              <div>Connections: {connections.length}</div>
              <div>Start Nodes: {nodes.filter(n => n.type === "start").length}</div>
              <div>End Nodes: {nodes.filter(n => n.type === "end").length}</div>

              {/* Case Management Stats */}
              {(
                workflowMetadata.casePriority
                || workflowMetadata.caseCategory

                // || workflowMetadata.targetCaseStatus
              ) && (
                <>
                  <div className="border-t border-gray-300 dark:border-gray-600 pt-1 mt-2"></div>
                  <div className="font-medium text-blue-600 dark:text-blue-400">Case Management:</div>
                  {workflowMetadata.casePriority && (
                    <div>Priority: <span className="font-medium">{casePriorityOptions.find(p => p.value === workflowMetadata.casePriority)?.label}</span></div>
                  )}
                  {workflowMetadata.caseCategory && (
                    <div>Category: <span className="font-medium">{caseCategoryOptions.find(c => c.value === workflowMetadata.caseCategory)?.label}</span></div>
                  )}

                  {/*
                  {workflowMetadata.targetCaseStatus && (
                    <div>Target: <span className="font-medium">{targetCaseStatusOptions.find(s => s.value === workflowMetadata.targetCaseStatus)?.label}</span></div>
                  )}
                  */}
                </>
              )}
            </div>
          </div>
        </div>

        {/* JSON Preview Dialog */}
        {showJsonPreview && permissions.hasAnyPermission(["workflow.create", "workflow.update"]) && (
          <Modal isOpen={showJsonPreview} onClose={() => setShowJsonPreview(false)} className="max-w-4xl p-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 cursor-default">Workflow JSON Preview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 cursor-default">{workflowMetadata.title}</p>
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
                onClick={() => setShowJsonPreview(false)}
                variant="error"
              >
                Cancel
              </Button>

              <Button
                onClick={copyJsonToClipboard}
                variant={`${
                  copiedJson 
                    ? "success"
                    : "outline"
                }`}
              >
                {copiedJson ? <CheckLineIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                {copiedJson ? "Copied!" : "Copy"}
              </Button>

              <Button
                onClick={downloadJsonWorkflow}
                variant="outline"
              >
                <DownloadIcon className="w-4 h-4" />
                Download
              </Button>

              <Button
                onClick={saveWorkflow}
                disabled={validationErrors.length > 0}
                variant={`${
                  validationErrors.length > 0
                    ? "outline"
                    : "primary"
                }`}
              >
                <DownloadIcon className="w-4 h-4" />
                Save
              </Button>
            </div>
          </Modal>
        )}

        {/* Import Dialog */}
        {showImportDialog && permissions.hasAnyPermission(["workflow.create", "workflow.update"]) && (
          <Modal isOpen={showImportDialog} onClose={() => setShowImportDialog(false)} className="max-w-4xl p-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 cursor-default">Import Workflow JSON</h3>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Upload JSON File
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Or Paste JSON Content
                </label>
                <TextArea
                  value={importJsonText}
                  onChange={(value) => setImportJsonText(value)}
                  className="w-full h-64 px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent font-mono text-sm"
                  placeholder="Paste your workflow JSON here..."
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 p-4">
              <Button
                onClick={() => setShowImportDialog(false)}
                variant="error"
              >
                Cancel
              </Button>
              <Button
                onClick={importJsonWorkflow}
                disabled={!importJsonText.trim()}
                variant={`${
                  !importJsonText.trim()
                    ? "outline"
                    : "success"
                }`}
              >
                <FileIcon className="w-4 h-4" />
                Import Workflow
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
                {/* Components Preview */}
                SOP Preview
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Generated form components based on workflow path</p>

              {/* Case Management Info Banner */}
              {(
                workflowMetadata.casePriority
                || workflowMetadata.caseCategory

                // || workflowMetadata.targetCaseStatus
              ) && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium text-blue-800 dark:text-blue-100">📋 Case Management:</span>
                    {workflowMetadata.casePriority && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        workflowMetadata.casePriority === "urgent" || workflowMetadata.casePriority === "critical" 
                          ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                          : workflowMetadata.casePriority === "high"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                          : workflowMetadata.casePriority === "medium"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                          : "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                      }`}>
                        {casePriorityOptions.find(p => p.value === workflowMetadata.casePriority)?.label}
                      </span>
                    )}
                    {workflowMetadata.caseCategory && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded text-xs font-medium">
                        {caseCategoryOptions.find(c => c.value === workflowMetadata.caseCategory)?.label}
                      </span>
                    )}

                    {/*
                    {workflowMetadata.targetCaseStatus && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded text-xs font-medium">
                        Target: {targetCaseStatusOptions.find(s => s.value === workflowMetadata.targetCaseStatus)?.label}
                      </span>
                    )}
                    */}
                  </div>
                </div>
              )}
            </div>
            
            <div className="py-4 overflow-auto cursor-default">
              {generateComponentsPreview().length > 0 ? (
                <div className="space-y-6">
                  {generateComponentsPreview().map((component, index) => (
                    <div key={component.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 text-xs font-medium px-2 py-1 rounded-full">
                          Step {index + 1}
                        </span>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{component.label}</h4>

                        {/* Component Type Badge */}
                        {component.type === "start" && (
                          <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs font-medium px-2 py-1 rounded-full">
                            Start
                          </span>
                        )}
                        {component.type === "form" && (
                          <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs font-medium px-2 py-1 rounded-full">
                            Form: {component.form}
                          </span>
                        )}
                        {component.type === "decision" && (
                          <span className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 text-xs font-medium px-2 py-1 rounded-full">
                            Decision
                          </span>
                        )}
                        {component.type === "end" && (
                          <span className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 text-xs font-medium px-2 py-1 rounded-full">
                            End
                          </span>
                        )}
                      </div>

                      {/* Start Component */}
                      {component.type === "start" && (
                        <div className="bg-green-100 dark:bg-green-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-green-800 dark:text-green-100">Workflow Start</span>
                            {component.continueFromWorkflow && (
                              <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 text-xs font-medium px-2 py-1 rounded-full">
                                <AngleLeftIcon className="w-4 h-4 inline" />
                                Continues from workflow
                              </span>
                            )}
                          </div>
                          {component.description && (
                            <p className="text-sm text-green-700 dark:text-green-200">{component.description}</p>
                          )}
                          {component.continueFromWorkflow && component.sourceWorkflowId && (
                            <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded border border-blue-200 dark:border-blue-700">
                              <p className="text-xs text-blue-700 dark:text-blue-200">
                                <strong>Source Workflow:</strong> {component.sourceWorkflowId}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Form Component */}
                      {component.type === "form" && (
                        <div>
                          {component.sla && (
                            <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                              <strong>SLA:</strong> {component.sla} hours
                            </div>
                          )}
                          {component.pic && (
                            <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                              <strong>PIC:</strong> {component.pic.replace("_", " ").toUpperCase()}
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {component.formConfig.fields.map((
                              field, fieldIndex
                            ) => (
                              <div
                                key={fieldIndex}
                                className="border border-gray-100 dark:border-gray-800 rounded p-3"
                              >
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                  {field.label} {field.required && <span className="text-red-500 dark:text-red-400">*</span>}
                                </label>
                                {field.type === "text" || field.type === "email" || field.type === "tel" || field.type === "number" ? (
                                  <Input
                                    type={field.type}
                                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                                  />
                                ) : field.type === "textarea" ? (
                                  <TextArea
                                    rows={2}
                                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                                  />
                                ) : field.type === "select" ? (
                                  <Select
                                    options={
                                      (field.options ?? []).map((option: string) => ({
                                        value: option,
                                        label: option
                                      }))
                                    }
                                    placeholder={`Select ${field.label.toLowerCase()}...`}
                                    onChange={() => {}}
                                    className="cursor-pointer"
                                  />
                                ) : field.type === "radio" ? (
                                  <div className="space-y-1">
                                    {field.options?.map((option: string, optIndex: number) => (
                                      <label key={optIndex} className="flex items-center gap-2">
                                        <Input
                                          type="radio"
                                          name={field.name}
                                          value={option}
                                        />
                                        <span className="text-sm text-gray-900 dark:text-white">{option}</span>
                                      </label>
                                    ))}
                                  </div>
                                ) : field.type === "checkbox" ? (
                                  <div className="space-y-1">
                                    {field.options?.map((option: string, optIndex: number) => (
                                      <label key={optIndex} className="flex items-center gap-2">
                                        <Input
                                          type="checkbox"
                                          value={option}
                                        />
                                        <span className="text-sm text-gray-900 dark:text-white">{option}</span>
                                      </label>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Decision Component */}
                      {component.type === "decision" && (
                        <div className="bg-yellow-100 dark:bg-yellow-800 p-3 rounded border">
                          <div className="text-sm text-gray-700 dark:text-gray-200">
                            <strong>Condition:</strong> {component.condition || "No condition specified"}
                          </div>

                          {/* Interactive Toggle Buttons */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                              Choose Decision Path:
                            </label>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleDecisionToggle(component.id, "yes")}
                                variant={decisionSelections[component.id] === "yes" ? "success" : "outline-success"}
                                size="xs"
                              >
                                <CheckLineIcon className="w-4 h-4" />
                                YES
                              </Button>
                              <Button
                                onClick={() => handleDecisionToggle(component.id, "no")}
                                variant={decisionSelections[component.id] === "no" ? "error" : "outline-error"}
                                size="xs"
                              >
                                <CloseIcon className="w-4 h-4" />
                                NO
                              </Button>
                            </div>
                          </div>

                          {/* Current Selection Display */}
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Current path: <strong>{decisionSelections[component.id] || "yes"}</strong>
                          </div>
                        </div>
                      )}

                      {/* End Component */}
                      {component.type === "end" && (
                        <div className="bg-red-100 dark:bg-red-800 p-4 rounded-lg border border-red-200 dark:border-red-700">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-red-800 dark:text-red-100">Workflow End</span>

                            {/* Updated: [20-06-2025] v0.1.7 */}
                            {component.allowContinuation && (
                              <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs font-medium px-2 py-1 rounded-full">
                                <AngleLeftIcon className="w-4 h-4" />
                                Allows continuation
                              </span>
                            )}
                          </div>
                          {component.description && (
                            <p className="text-sm text-red-700 dark:text-red-200">{component.description}</p>
                          )}

                          {/* Updated: [20-06-2025] v0.1.7 */}
                          {component.allowContinuation && component.nextWorkflowId && (
                            <div className="bg-green-100 dark:bg-green-800 p-2 rounded border border-green-200 dark:border-green-700">
                              <p className="text-xs text-green-700 dark:text-green-200">
                                <strong>Next Workflow:</strong> {component.nextWorkflowId}
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
                  <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">No Components to Preview</div>
                  <p className="text-gray-400 dark:text-gray-500">
                    Add start, process, and end nodes with connections to generate component previews
                  </p>
                </div>
              )}
            </div>
            
            <div
              className="flex items-center justify-end gap-2 p-4"
            >
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {Object.keys(decisionSelections).length > 0 && (
                  <span>
                    Decisions: {Object.entries(decisionSelections).map(([id, decision]) => {
                      const node = nodes.find(n => n.id === id);
                      return `${node?.data.label}: ${decision.toUpperCase()}`;
                    }).join(", ")}
                  </span>
                )}
              </div>

              <Button
                onClick={() => setShowComponentsPreview(false)}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
};

export default WorkflowEditorComponent;
