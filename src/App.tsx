import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  addEdge,
  Connection,
  Edge, Node,
  useReactFlow,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  FinalConnectionState
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
const getId = () => `w3cnode_${id++}`;

const defaultData: { [key: string]: { in: string; out: string } } = {
  'textInput': { in: '', out: Utf8DataTransfer.encodeString('Web3 キャンバス') },
  'numberInput': { in: '', out: Utf8DataTransfer.encodeNumber(0) },
}

const W3CFlow: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useW3C();

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // check if the dropped element is valid
      if (!type) {
        return;
      }

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
    [screenToFlowPosition, setNodes, type],
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
      if (!connectionState.isValid) {
        const id = getId();
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;
  
        // Ensure the handle is a string.
        // If connectionState.fromHandle is an object, extract its 'id' property.
        const sourceHandle =
          typeof connectionState.fromHandle === "object"
            ? connectionState.fromHandle?.id
            : connectionState.fromHandle;
  
        // Create a new node that binds its input to the output of the source node.
        const newNode: Node = {
          id,
          type: "textView",
          position: screenToFlowPosition({ x: clientX, y: clientY }),
          data: {
            binding: {
              sourceId: connectionState.fromNode?.id,
              sourceField: sourceHandle, // e.g., "publicKey", "privateKey", or "address"
            },
            in: "",
            out: "",
          },
        };
  
        // Create the edge with the properly extracted source handle.
        const newEdge: Edge = {
          id,
          source: connectionState.fromNode?.id as string,
          sourceHandle: sourceHandle, // now a string
          target: id,
          targetHandle: "input", // adjust if your target handle differs
          // binding: true,
        };
  
        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) => eds.concat(newEdge));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
          fitView
          style={{ backgroundColor: "#F7F9FB" }}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      <Sidebar />
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