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
};

let id = 0;
const flowKey = 'w3cflow';
const getId = () => `w3cnode_${id++}`;

const defaultData: { [key: string]: { in: string; out: string } } = {
  'textInput': { in: '', out: Utf8DataTransfer.encodeString('Web3 キャンバス') },
  'numberInput': { in: '', out: Utf8DataTransfer.encodeNumber(0) },
};

// ─── COPY/PASTE CUSTOM HOOK (nodes & edges) ────────────────────────────────
const useCopyPaste = (rfInstance: ReactFlowInstance<Node, Edge> | null) => {
  const onCopy = useCallback((event: ClipboardEvent) => {
    event.preventDefault();
    if (!rfInstance) return;
    const selectedNodes = rfInstance.getNodes().filter((n) => n.selected);
    const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));
    const selectedEdges = rfInstance
      .getEdges()
      .filter((e) => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target));
    const dataToCopy = { nodes: selectedNodes, edges: selectedEdges };
    event.clipboardData?.setData('application/json', JSON.stringify(dataToCopy));
  }, [rfInstance]);

  const onPaste = useCallback((event: ClipboardEvent) => {
    event.preventDefault();
    if (!rfInstance) return;
    const clipboardData = event.clipboardData?.getData('application/json');
    if (!clipboardData) return;
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
// ───────────────────────────────────────────────────────────────────────────

// ─── SAVED STATE ITEM COMPONENT ──────────────────────────────────────────────
type SavedState = {
  id: number;
  timestamp: string;
  name: string;
  flow: any;
};

type SavedInstanceItemProps = {
  savedState: SavedState;
  index: number;
  totalCount: number;
  onUpdateName: (id: number, newName: string) => void;
  onRestore: (flow: any) => void;
  onDelete: (id: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
};

const SavedInstanceItem: React.FC<SavedInstanceItemProps> = ({
  savedState,
  index,
  totalCount,
  onUpdateName,
  onRestore,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(savedState.name);

  const handleEditClick = () => setEditing(true);
  const handleConfirmClick = () => {
    onUpdateName(savedState.id, name);
    setEditing(false);
  };

  return (
    <li style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
      {editing ? (
        <>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginRight: '5px' }}
          />
          <button onClick={handleConfirmClick}>✔️</button>
        </>
      ) : (
        <>
          <span style={{ marginRight: '5px' }}>{savedState.name}</span>
          <button onClick={handleEditClick}>✏️</button>
        </>
      )}
      <button onClick={() => onDelete(savedState.id)} style={{ marginLeft: '5px' }}>
        🗑️
      </button>
      <button onClick={() => onMoveUp(index)} disabled={index === 0} style={{ marginLeft: '5px' }}>
        ⬆️
      </button>
      <button
        onClick={() => onMoveDown(index)}
        disabled={index === totalCount - 1}
        style={{ marginLeft: '5px' }}
      >
        ⬇️
      </button>
      <button onClick={() => onRestore(savedState.flow)} style={{ marginLeft: '10px' }}>
        Restore
      </button>
    </li>
  );
};
// ───────────────────────────────────────────────────────────────────────────

// ─── SAVE/RESTORE STACK & FILE UPLOAD ─────────────────────────────────────────
const W3CFlow: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition } = useReactFlow();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<Node, Edge> | null>(null);
  const [type] = useW3C();
  const [savedStates, setSavedStates] = useState<SavedState[]>([]);
  const [panelVisible, setPanelVisible] = useState(false); // Panel collapsed by default

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
    },
    [screenToFlowPosition, setNodes, type]
  );

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
      }
    },
    [screenToFlowPosition]
  );

  // ─── SAVE STATE: DOWNLOAD FILE & SAVE TO STACK (new states on top) ─────
  const handleSaveState = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      const timestamp = new Date().toISOString();
      const newSavedState: SavedState = {
        id: Date.now(),
        timestamp,
        name: timestamp, // default name
        flow,
      };
      setSavedStates((prev) => [newSavedState, ...prev]);

      // Download file
      const flowString = JSON.stringify(flow, null, 2);
      const blob = new Blob([flowString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flow_${timestamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [rfInstance]);

  // ─── RESTORE STATE FROM FLOW OBJECT ──────────────────────────────────────
  const restoreState = useCallback((flow: any) => {
    if (flow) {
      const { x = 0, y = 0, zoom = 1 } = flow.viewport;
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
      rfInstance?.setViewport({ x, y, zoom });
    }
  }, [rfInstance, setNodes, setEdges]);

  // ─── UPLOAD STATE FROM FILE ──────────────────────────────────────────────
  const handleUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const flow = JSON.parse(reader.result as string);
        restoreState(flow);
      } catch (err) {
        console.error("Failed to parse uploaded file:", err);
      }
    };
    reader.readAsText(file);
  }, [restoreState]);

  // ─── SAVE & RESTORE TO LOCAL STORAGE (existing functions) ──────────────
  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);
 
  const onRestore = useCallback(() => {
    const flow = localStorage.getItem(flowKey)
      ? JSON.parse(localStorage.getItem(flowKey) as string)
      : null;
    if (flow) {
      const { x = 0, y = 0, zoom = 1 } = flow.viewport;
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
      rfInstance?.setViewport({ x, y, zoom });
    }
  }, [setNodes, screenToFlowPosition, rfInstance, setEdges]);

  // ─── FUNCTIONS TO MANAGE SAVED STATES ─────────────────────────────────────
  const updateStateName = useCallback((id: number, newName: string) => {
    setSavedStates((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
    );
  }, []);

  const deleteState = useCallback((id: number) => {
    setSavedStates((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const moveStateUp = useCallback((index: number) => {
    setSavedStates((prev) => {
      if (index <= 0) return prev;
      const newArray = [...prev];
      [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
      return newArray;
    });
  }, []);

  const moveStateDown = useCallback((index: number) => {
    setSavedStates((prev) => {
      if (index >= prev.length - 1) return prev;
      const newArray = [...prev];
      [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
      return newArray;
    });
  }, []);

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
          onInit={setRfInstance}
          fitView
          style={{ backgroundColor: "#F7F9FB" }}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      <Sidebar onSave={onSave} onRestore={onRestore} />

      {/* Toggle Button for the Save-Restore Panel */}
      <div style={{ marginTop: '10px' }}>
        <button onClick={() => setPanelVisible((prev) => !prev)}>
          {panelVisible ? 'Hide Save/Restore Panel' : 'Show Save/Restore Panel'}
        </button>
      </div>

      {/* Save-Restore Panel (conditionally rendered) */}
      {panelVisible && (
        <div style={{ padding: '10px', background: '#eee', marginTop: '10px' }}>
          <button onClick={handleSaveState}>Save & Download Flow</button>
          <input
            type="file"
            accept="application/json"
            onChange={handleUpload}
            style={{ marginLeft: '10px' }}
          />
          <h3>Saved States</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {savedStates.map((state, index) => (
              <SavedInstanceItem
                key={state.id}
                savedState={state}
                index={index}
                totalCount={savedStates.length}
                onUpdateName={updateStateName}
                onRestore={restoreState}
                onDelete={deleteState}
                onMoveUp={moveStateUp}
                onMoveDown={moveStateDown}
              />
            ))}
          </ul>
        </div>
      )}
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
