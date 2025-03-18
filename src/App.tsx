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
  MiniMap,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import LZString from 'lz-string';
import { W3CProvider, useW3C } from './W3CContext';
import Sidebar from './Sidebar';
import { Utf8DataTransfer } from "./Utf8DataTransfer";
import { ToastProvider } from './ToastProvider';
import NodeSearchModal, { NodeOption } from './NodeSearchModal';
import ConnectionLine from './ConnectionLine';
import { SignalEdge } from './SignalEdge';


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
import Annotation from './nodes/utils/Annotation';
import BigIntNode from './nodes/utils/BigInt';
import Compound from './nodes/utils/Compound';
import Compare from './nodes/utils/Equals';
import DrawingNode from './nodes/utils/Drawing';
import Group from './nodes/utils/Group';
import ImageNode from './nodes/utils/Image';
import NodeIdNode from './nodes/utils/NodeId';
import Substring from './nodes/utils/Substring';
import StrLengthNode from './nodes/utils/StrLength';
import SeedPhraseNode from './nodes/utils/SeedPhrase';
import ArithmeticNode from './nodes/utils/Arithmetic';
// actors
import ActorNode from './nodes/actors/Actor';
import Interval from './nodes/actors/Interval';
import Ledger from './nodes/actors/Ledger';
import MakeActorMessage from './nodes/actors/MakeActorMessage';
import NetworkNode from './nodes/actors/Network';
import { W3CMessageQueue, W3CQueueMessage, W3CQueueMessageType } from './infrastructure/Queue';

ReactGA.initialize("G-QPYSF5N8BL");

export const nodeTypesCategorized = {
  cryptography: {
    calculateAddress: {
      class: CalculateAddress,
      label: "Calculate Address",
    },
    encrypt: {
      class: Encrypt,
      label: "Encrypt",
    },
    decrypt: {
      class: Decrypt,
      label: "Decrypt",
    },
    hash: {
      class: Hash,
      label: "Hash",
    },
    keypair: {
      class: KeyPairNode,
      label: "Keypair",
    },
    scalarMultiplication: {
      class: ScalarMultiplication,
      label: "Scalar Multiplication",
    },
    signMessage: {
      class: SignMessageNode,
      label: "Sign Message",
    },
    verifySignature: {
      class: VerifySignatureNode,
      label: "Verify Signature",
    },
  },
  input: {
    textInput: {
      class: TextInputNode,
      label: "Text Input",
    },
    numberInput: {
      class: NumberInputNode,
      label: "Number Input",
    },
    fileInput: {
      class: FileInputNode,
      label: "File Input",
    },
  },
  view: {
    textView: {
      class: TextViewNode,
      label: "Text View",
    },
    qr: {
      class: QRCode,
      label: "QR",
    },
    color: {
      class: ColorViewNode,
      label: "Color",
    },
  },
  ethereum: {
    balance: {
      class: EthBalanceNode,
      label: "Balance",
    },
    ethToUsd: {
      class: EthToUsdNode,
      label: "ETH to USD",
    },
    makeTransaction: {
      class: MakeTransactionNode,
      label: "Make Transaction",
    },
    broadcastTransaction: {
      class: BroadcastTransactionNode,
      label: "Broadcast Transaction",
    }
  },
  utils: {
    annotation: {
      class: Annotation,
      label: "Annotation",
    },
    bigint: {
      class: BigIntNode,
      label: "Bigint",
    },
    compound: {
      class: Compound,
      label: "Compound",
    },
    compare: {
      class: Compare,
      label: "Compare",
    },
    drawing: {
      class: DrawingNode,
      label: "Drawing",
    },
    group: {
      class: Group,
      label: "Group",
    },
    image: {
      class: ImageNode,
      label: "Image",
    },
    nodeId: {
      class: NodeIdNode,
      label: "Node ID",
    },
    substring: {
      class: Substring,
      label: "Substring",
    },
    length: {
      class: StrLengthNode,
      label: "Length",
    },
    seed: {
      class: SeedPhraseNode,
      label: "Seed",
    },
    arithmetic: {
      class: ArithmeticNode,
      label: "Arithmetic",
    }
  },
  actors: {
    actor: {
      class: ActorNode,
      label: "Actor",
    },
    interval: {
      class: Interval,
      label: "Interval",
    },
    ledger: {
      class: Ledger,
      label: "Ledger",
    },
    makeActorMessage: {
      class: MakeActorMessage,
      label: "Make Actor Message",
    },
    network: {
      class: NetworkNode,
      label: "Network",
    }
  },
};

const nodeTypes = Object.values(nodeTypesCategorized).reduce((acc: { [key: string]: any }, category) => {
  Object.entries(category).forEach(([key, value]) => {
    acc[key] = value.class;
  });
  return acc;
}, {});

const edgeTypes = {
  signal: SignalEdge,
};

class NodeIdProvider {
  static id: number = 0;
  static getId() {
    return `w3cnode_${++NodeIdProvider.id}`;
  }
}

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
        const newId = NodeIdProvider.getId();
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
        id: NodeIdProvider.getId(),
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
  const { getNode, updateNodeData, getIntersectingNodes, screenToFlowPosition } = useReactFlow();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<Node, Edge> | null>(null);
  const [type] = useW3C();
  const [undoStack, setUndoStack] = useState<FlowSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<FlowSnapshot[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const queue: W3CMessageQueue = W3CMessageQueue.getInstance();
  queue.subscribe("app", () => {
    const message: W3CQueueMessage = queue.peek();
    if (message.type === W3CQueueMessageType.Node) {
      queue.dequeue();
      for (let i = 0; i < message.to.length; i++) {
        const node = getNode(message.to[i]);
        if (node) {
          updateNodeData(node.id, { ...node.data, triggered: true });
        }
      }
      // const node = getNode(message.to[0]);
      // if (node) {
      //   // updateNodeData(node.id, { ...node.data, out: Utf8DataTransfer.encodeString(message.payload) });
      //   updateNodeData(node.id, { ...node.data, triggered: true });
      // }
    }
  });

  useEffect(() => {
    if (!rfInstance) return;

    // Check for a URL parameter "state" on initialization
    const params = new URLSearchParams(window.location.search);
    const compressedState = params.get("state");

    if (compressedState) {
      const jsonState = LZString.decompressFromEncodedURIComponent(compressedState);
      if (jsonState) {
        try {
          // Decode the state from the URL (assuming it was encoded via encodeURIComponent(JSON.stringify(flow)))
          const decodedState = JSON.parse(jsonState) as FlowSnapshot;

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
    (params: Connection) => {
      let newEdge: Edge;
      let sourceNode = getNode(params.source);
      let targetNode = getNode(params.target);
      if (sourceNode?.type === "interval" || targetNode?.type === "interval") {
        newEdge = { id: params.target + params.source, ...params, type: "signal" };
        // newEdge = { id: params.target + params.source, ...params, animated: true, style: { stroke: "#F57DBD" }, label: "Node ID" };
      } else {
        newEdge = { id: params.target + params.source, ...params, markerEnd: { type: MarkerType.ArrowClosed }, type: "smoothstep" };
      }
      setEdges((eds) => addEdge(newEdge, eds));
    },
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
      createNode(type, event.clientX, event.clientY);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [screenToFlowPosition, setNodes, type]
  );

  function createNode(type: string, x: number, y: number) {
    const data = type in defaultData ? defaultData[type] : { in: '', out: '' };
    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!reactFlowBounds) return;
    const position = screenToFlowPosition({
      x: x - reactFlowBounds.left,
      y: y - reactFlowBounds.top,
    });
    const newNode: Node = {
      id: NodeIdProvider.getId(),
      type,
      position: position,//screenToFlowPosition({ x, y }),
      data: data,
    };
    setNodes((nds) => nds.concat(newNode));
    pushSnapshot();
  }

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
      } else if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        setShowModal(true);
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
        const id = NodeIdProvider.getId();
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;
        const sourceHandle =
          typeof connectionState.fromHandle === "object"
            ? connectionState.fromHandle?.id
            : connectionState.fromHandle;
        let nodeType = "";
        if (connectionState.fromHandle?.id?.endsWith("__id")) {
          nodeType = "nodeId";
        }
        else if (connectionState.fromNode?.type !== "textView") {
          nodeType = "textView";
        }
        const newNode: Node = {
          id,
          type: nodeType,
          position: screenToFlowPosition({ x: clientX, y: clientY }),
          data: {
            binding: {
              sourceId: connectionState.fromNode?.id,
              sourceField: sourceHandle,
            },
            in: "",
            out: "",
          },
        }
        const newEdge: Edge = {
          id,
          source: connectionState.fromNode?.id as string,
          sourceHandle: sourceHandle,
          target: id,
          targetHandle: "input",
          type: "smoothstep",
          markerEnd: { type: MarkerType.Arrow },
        };
        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) => eds.concat(newEdge));
        pushSnapshot();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [screenToFlowPosition]
  );

  const handleSelectNode = useCallback(
    (nodeType: NodeOption) => {
      if (!rfInstance) return;
      const { innerWidth, innerHeight } = window;
      const x = (innerWidth / 2) - 420;
      const y = (innerHeight / 2) - 100;
      createNode(nodeType.type, x, y);
      setShowModal(false);
    },
    [nodes, rfInstance]
  );

  return (
    <div className="w3cflow">
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodes={nodes}
          edges={edges}
          connectionLineComponent={ConnectionLine}
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
        createNode={createNode}
      />
      <NodeSearchModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        onSelectNode={handleSelectNode}
      />
    </div>
  );
};

const App: React.FC = () => (
  <ToastProvider>
    <ReactFlowProvider>
      <W3CProvider>
        <W3CFlow />
      </W3CProvider>
    </ReactFlowProvider>
  </ToastProvider>
);

export { NodeIdProvider };
export default App;
