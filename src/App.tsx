import { useCallback, useEffect, useRef, useState } from 'react';
import ReactGA from "react-ga4";
import {
  ReactFlow,
  Controls,
  Background,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  FinalConnectionState,
  ReactFlowInstance,
  MiniMap
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { W3CProvider, useW3C } from './W3CContext';
import Sidebar from './Sidebar';
import { Utf8DataTransfer } from "./Utf8DataTransfer";
// cryptography
import CalculateAddress from './nodes/cryptography/CalculateAddress';
import Decrypt from './nodes/cryptography/Decrypt';
import Encrypt from './nodes/cryptography/Encrypt';
import Hash from './nodes/cryptography/Hash';
import KeyPairNode from './nodes/cryptography/KeyPair';
import ScalarMultiplication from './nodes/cryptography/ScalarMultiplication';
import SignMessageNode from './nodes/cryptography/SignMessage';
import VerifySignatureNode from './nodes/cryptography/VerifySignature';
// input
import TextInputNode from './nodes/input/TextInput';
import NumberInputNode from './nodes/input/NumberInput';
import FileInputNode from './nodes/input/FileInput';
// view
import TextViewNode from './nodes/view/TextView';
import QRCode from './nodes/view/QRCode';
import ColorViewNode from './nodes/view/ColorView';
// web3
import EthBalanceNode from './nodes/web3/Balance';
import EthToUsdNode from './nodes/web3/EthToUsd';
import MakeTransactionNode from './nodes/web3/MakeTransaction';
import BroadcastTransactionNode from './nodes/web3/BroadcastTransaction';
// utils
import BigIntNode from './nodes/utils/BigInt';
import Compound from './nodes/utils/Compound';
import Equals from './nodes/utils/Equals';
import Group from './nodes/utils/Group';
import Substring from './nodes/utils/Substring';
import StrLengthNode from './nodes/utils/StrLength';
import SeedPhraseNode from './nodes/utils/SeedPhrase';
import IncrementDecrementNode from './nodes/utils/IncrementDecrement';
// actors
import ActorNode from './nodes/actors/Actor';
import MakeActorMessage from './nodes/actors/MakeActorMessage';

ReactGA.initialize("G-QPYSF5N8BL");



const nodeTypes = {
  // cryptography
  calculateAddress: CalculateAddress,
  encrypt: Encrypt,
  decrypt: Decrypt,
  hash: Hash,
  keypair: KeyPairNode,
  scalarMultiplication: ScalarMultiplication,
  signMessage: SignMessageNode,
  verifySignature: VerifySignatureNode,
  // input
  textInput: TextInputNode,
  numberInput: NumberInputNode,
  fileInput: FileInputNode,
  // view
  textView: TextViewNode,
  qr: QRCode,
  color: ColorViewNode,
  // web3
  balance: EthBalanceNode,
  ethToUsd: EthToUsdNode,
  makeTransaction: MakeTransactionNode,
  broadcastTrascation: BroadcastTransactionNode,
  // utils
  bigint: BigIntNode,
  compound: Compound,
  equals: Equals,
  group: Group,
  substring: Substring,
  length: StrLengthNode,
  seed: SeedPhraseNode,
  incrementDecrement: IncrementDecrementNode,
  // actors
  actor: ActorNode,
  makeActorMessage: MakeActorMessage,
};

let id = 0;
const getId = () => `w3cnode_${id++}`;

const defaultData: { [key: string]: { in: string; out: string } } = {
  'textInput': { in: '', out: Utf8DataTransfer.encodeString('Web3 キャンバス') },
  'numberInput': { in: '', out: Utf8DataTransfer.encodeNumber(0) },
};

type FlowSnapshot = {
  nodes: Node[];
  edges: Edge[];
  viewport: { x: number; y: number; zoom: number };
};

const customMimeType = 'application/x-xyflow';

const useCopyPaste = (rfInstance: ReactFlowInstance<Node, Edge> | null) => {
  const onCopy = useCallback((event: ClipboardEvent) => {
    if (!rfInstance) return;
    // Only intercept if there are selected nodes (i.e. our custom copy scenario)
    const selectedNodes = rfInstance.getNodes().filter((n) => n.selected);
    if (selectedNodes.length === 0) {
      // No nodes selected: allow default copy behavior
      return;
    }
    event.preventDefault();
    const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));
    const selectedEdges = rfInstance
      .getEdges()
      .filter((e) => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target));
    const dataToCopy = { nodes: selectedNodes, edges: selectedEdges };
    // Use a custom MIME type to avoid interfering with normal text copy-paste
    event.clipboardData?.setData(customMimeType, JSON.stringify(dataToCopy));
  }, [rfInstance]);

  const onPaste = useCallback((event: ClipboardEvent) => {
    if (!rfInstance) return;
    // Check if our custom data exists in the clipboard
    const clipboardData = event.clipboardData?.getData(customMimeType);
    if (!clipboardData) {
      // No custom data: allow default paste behavior
      return;
    }
    event.preventDefault();
    try {
      const { nodes: copiedNodes, edges: copiedEdges } = JSON.parse(clipboardData);
      const oldToNewMap = new Map<string, string>();
      const newNodes: Node[] = copiedNodes.map((node: Node) => {
        const newId = getId();
        oldToNewMap.set(node.id, newId);
        return {
          ...node,
          id: newId,
          selected: true,
          position: { x: node.position.x + 20, y: node.position.y + 20 },
        };
      });
      const newEdges: Edge[] = copiedEdges.map((edge: Edge) => ({
        ...edge,
        id: getId(),
        selected: true,
        source: oldToNewMap.get(edge.source) || edge.source,
        target: oldToNewMap.get(edge.target) || edge.target,
      }));
      const updatedNodes = rfInstance.getNodes().map((n) => ({ ...n, selected: false }));
      const updatedEdges = rfInstance.getEdges().map((e) => ({ ...e, selected: false }));
      rfInstance.setNodes([...updatedNodes, ...newNodes]);
      rfInstance.setEdges([...updatedEdges, ...newEdges]);
    } catch (err) {
      console.error('Error parsing clipboard data:', err);
    }
  }, [rfInstance]);

  useEffect(() => {
    window.addEventListener('copy', onCopy);
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('copy', onCopy);
      window.removeEventListener('paste', onPaste);
    };
  }, [onCopy, onPaste]);
};

const W3CFlow: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { getIntersectingNodes, screenToFlowPosition } = useReactFlow();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<Node, Edge> | null>(null);
  const [type] = useW3C();
  const [undoStack, setUndoStack] = useState<FlowSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<FlowSnapshot[]>([]);

  useEffect(() => {
    if (!rfInstance) return;
  
    // Check for a URL parameter "state" on initialization
    const params = new URLSearchParams(window.location.search);
    const stateParam = params.get("state");
  
    if (stateParam) {
      try {
        // Decode the state from the URL (assuming it was encoded via encodeURIComponent(JSON.stringify(flow)))
        const decodedState = JSON.parse(decodeURIComponent(stateParam)) as FlowSnapshot;
  
        // Apply the decoded state
        setNodes(decodedState.nodes);
        setEdges(decodedState.edges);
        if (decodedState.viewport) {
          rfInstance.setViewport(decodedState.viewport);
        }
  
        // Optionally, push this initial state into your undo stack so that it becomes part of your push/pop mechanism
        pushSnapshot();
  
        // Optionally, remove the state parameter from the URL to prevent re-loading on subsequent renders
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error("Failed to load canvas state from URL:", err);
      }
    }
  }, [rfInstance, setNodes, setEdges]);  

  // Undo: Pop snapshot from undo stack, push current state onto redo stack,
  // then restore the snapshot.
  const undo = useCallback(() => {
    if (!rfInstance || undoStack.length === 0) return;
    const snapshot = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    // Push current state to redo stack
    const currentFlow = rfInstance.toObject();
    const currentSnapshot: FlowSnapshot = {
      nodes: currentFlow.nodes,
      edges: currentFlow.edges,
      viewport: currentFlow.viewport,
    };
    setRedoStack((prev) => [...prev, currentSnapshot]);
    // Restore snapshot
    setNodes(snapshot.nodes);
    setEdges(snapshot.edges);
    rfInstance.setViewport(snapshot.viewport);
  }, [rfInstance, undoStack, setNodes, setEdges]);

  // Redo: Pop snapshot from redo stack, push current state onto undo stack,
  // then restore snapshot.
  const redo = useCallback(() => {
    if (!rfInstance || redoStack.length === 0) return;
    const snapshot = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    const currentFlow = rfInstance.toObject();
    const currentSnapshot: FlowSnapshot = {
      nodes: currentFlow.nodes,
      edges: currentFlow.edges,
      viewport: currentFlow.viewport,
    };
    setUndoStack((prev) => [...prev, currentSnapshot]);
    setNodes(snapshot.nodes);
    setEdges(snapshot.edges);
    rfInstance.setViewport(snapshot.viewport);
  }, [rfInstance, redoStack, setNodes, setEdges]);

  // Initialize copy–paste functionality
  useCopyPaste(rfInstance);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!type) return;
      const data = type in defaultData ? defaultData[type] : { in: '', out: '' };
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: data,
      };
      setNodes((nds) => nds.concat(newNode));
      pushSnapshot();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [screenToFlowPosition, setNodes, type]
  );

  //FIXME: I should be able to drop a group after other nodes and then drop nodes inside the group
  // probably need to reorder the nodes array if on drop a group is dropped
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  const onNodeDragStop = (_event: any, draggedNode: Node, _draggedNodes: Node[]) => {
    let computedAbsolutePos = draggedNode.position;
    if (draggedNode.parentId) {
      // If the node is inside a group, add the parent's absolute position
      const parent = nodes.find((n) => n.id === draggedNode.parentId);
      if (parent) {
        computedAbsolutePos = {
          x: parent.position.x + draggedNode.position.x,
          y: parent.position.y + draggedNode.position.y,
        };
      }
    }
    const intersections: Node[] = getIntersectingNodes(draggedNode).filter((n) => n.type === 'group');
    if (intersections.length > 0) {
      for (let i = 0; i < intersections.length; i++) {
        const targetGroup = intersections[i];
        draggedNode.parentId = targetGroup.id;
        draggedNode.position = {
          x: computedAbsolutePos.x - targetGroup.position.x,
          y: computedAbsolutePos.y - targetGroup.position.y,
        };
      }
    } else {
      draggedNode.parentId = undefined;
      draggedNode.position = computedAbsolutePos;
    }
    setNodes((nds) => nds.map((n) => (n.id === draggedNode.id ? draggedNode : n)));
    pushSnapshot();
  };


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid interfering with default behavior if focus is in an input or textarea.
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (!rfInstance) return;

        // Get selected nodes and selected edges
        const selectedNodes = rfInstance.getNodes().filter(node => node.selected);
        const selectedEdges = rfInstance.getEdges().filter(edge => edge.selected);

        // If any nodes or edges are selected, proceed with deletion
        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          const selectedNodeIds = new Set(selectedNodes.map(node => node.id));

          // Remove nodes that are selected
          setNodes(nds => nds.filter(node => !selectedNodeIds.has(node.id)));

          // Remove edges that are either selected directly or connected to a selected node
          setEdges(eds =>
            eds.filter(edge =>
              !edge.selected &&
              !selectedNodeIds.has(edge.source) &&
              !selectedNodeIds.has(edge.target)
            )
          );

          pushSnapshot();
        }
      } else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [rfInstance, setNodes, setEdges, undo, redo]);


  // Helper: Capture current flow state as a snapshot
  function pushSnapshot() {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      const snapshot: FlowSnapshot = {
        nodes: flow.nodes,
        edges: flow.edges,
        viewport: flow.viewport,
      };
      setUndoStack((prev) => [...prev, snapshot]);
      // Clear redo stack on new action
      setRedoStack([]);
    }
  }

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
      if (!connectionState.isValid) {
        const id = getId();
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;
        const sourceHandle =
          typeof connectionState.fromHandle === "object"
            ? connectionState.fromHandle?.id
            : connectionState.fromHandle;
        const newNode: Node = {
          id,
          type: "textView",
          position: screenToFlowPosition({ x: clientX, y: clientY }),
          data: {
            binding: {
              sourceId: connectionState.fromNode?.id,
              sourceField: sourceHandle,
            },
            in: "",
            out: "",
          },
        };
        const newEdge: Edge = {
          id,
          source: connectionState.fromNode?.id as string,
          sourceHandle: sourceHandle,
          target: id,
          targetHandle: "input",
        };
        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) => eds.concat(newEdge));
        pushSnapshot();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [screenToFlowPosition]
  );

  return (
    <div className="w3cflow">
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onChange={pushSnapshot}
          onInit={setRfInstance}
          onNodeDragStop={onNodeDragStop}
          fitView
          style={{ backgroundColor: "#F7F9FB" }}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      <Sidebar
        rfInstance={rfInstance}
        setNodes={setNodes}
        setEdges={setEdges}
      />
    </div>
  );
};

const App: React.FC = () => (
  <ReactFlowProvider>
    <W3CProvider>
      <W3CFlow />
    </W3CProvider>
  </ReactFlowProvider>
);

export default App;
