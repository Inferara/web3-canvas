import { useCallback, useEffect, useRef, useState } from 'react';
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
  ReactFlowInstance
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { W3CProvider, useW3C } from './W3CContext';
import Sidebar from './Sidebar';
import { Utf8DataTransfer } from "./Utf8DataTransfer";

import Decrypt from './nodes/cryptography/Decrypt';
import Encrypt from './nodes/cryptography/Encrypt';
import Hash from './nodes/cryptography/Hash';
import KeyPairNode from './nodes/cryptography/KeyPair';
import SignMessageNode from './nodes/cryptography/SignMessage';
import VerifySignatureNode from './nodes/cryptography/VerifySignature';

import TextInputNode from './nodes/input/TextInput';
import NumberInputNode from './nodes/input/NumberInput';
import FileInputNode from './nodes/input/FileInput';

import TextViewNode from './nodes/view/TextView';
import QRCode from './nodes/view/QRCode';
import ColorViewNode from './nodes/view/ColorView';

import EthBalanceNode from './nodes/web3/Balance';
import EthToUsdNode from './nodes/web3/EthToUsd';
import MakeTransactionNode from './nodes/web3/MakeTransaction';
import BroadcastTransactionNode from './nodes/web3/BroadcastTransaction';

import Compound from './nodes/utils/Compound';
import Substring from './nodes/utils/Substring';
import StrLengthNode from './nodes/utils/StrLength';
import SeedPhraseNode from './nodes/utils/SeedPhrase';
import IncrementDecrementNode from './nodes/utils/IncrementDecrement';

const nodeTypes = {
  // cryptography
  encrypt: Encrypt,
  decrypt: Decrypt,
  hash: Hash,
  keypair: KeyPairNode,
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
  compound: Compound,
  substring: Substring,
  length: StrLengthNode,
  seed: SeedPhraseNode,
  incrementDecrement: IncrementDecrementNode,
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
  const { screenToFlowPosition } = useReactFlow();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<Node, Edge> | null>(null);
  const [type] = useW3C();
  const [undoStack, setUndoStack] = useState<FlowSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<FlowSnapshot[]>([]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid interfering with default behavior if focus is in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

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
          onNodeDragStop={pushSnapshot}
          fitView
          style={{ backgroundColor: "#F7F9FB" }}
        >
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
