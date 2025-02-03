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

import TextInputNode from './nodes/input/TextInput';
import NumberInputNode from './nodes/input/NumberInput';
import FileInputNode from './nodes/input/FileInput';

import TextViewNode from './nodes/view/TextView';
import QRCode from './nodes/view/QRCode';
import ColorViewNode from './nodes/view/ColorView';

import Hash from './nodes/web3/Hash';


import Compound from './nodes/Compound';
import Substring from './nodes/Substring';
import LengthViewNode from './nodes/LengthView';
import SeedPhraseNode from './nodes/SeedPhrase';
import KeyPairNode from './nodes/KeyPair';
import SignMessageNode from './nodes/SignMessage';
import VerifySignatureNode from './nodes/VerifySignature';

const nodeTypes = {
  textInput: TextInputNode,
  numberInput: NumberInputNode,
  fileInput: FileInputNode,
  textView: TextViewNode,
  hash: Hash,
  compound: Compound,
  qr: QRCode,
  substring: Substring,
  length: LengthViewNode,
  color: ColorViewNode,
  seed: SeedPhraseNode,
  keypair: KeyPairNode,
  signMessage: SignMessageNode,
  verifySignature: VerifySignatureNode,
};

let id = 0;
const getId = () => `w3cnode_${id++}`;

const defaultData: { [key: string]: { in: string; out: string } } = {
  'textInput': { in: '', out: Utf8DataTransfer.encodeString('Web3 キャンバス') },
  'numberInput': { in: '', out: Utf8DataTransfer.encodeNumber(5) },
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
  
        // Create a new node that binds its `in` field to the source node's `out`
        const newNode: Node = {
          id,
          type: "textView",
          position: screenToFlowPosition({ x: clientX, y: clientY }),
          data: {
            // Instead of copying the value, store a binding reference so that
            // your textView component knows to subscribe to updates on the source.
            binding: {
              sourceId: connectionState.fromNode?.id,
              sourceField: "out",
            },
            // Optionally initialize `in` as empty. The textView component can check
            // for the presence of a binding and subscribe to changes.
            in: "",
            out: "",
          },
        };
  
        // Create an edge that connects the two nodes.
        // Optionally, mark this edge as a binding edge.
        const newEdge: Edge = {
          id,
          source: connectionState.fromNode?.id as string,
          target: id,
        };
  
        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) => eds.concat(newEdge));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
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