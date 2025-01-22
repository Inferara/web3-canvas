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
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import TextInputNode from './nodes/TextInput';
import TextViewNode from './nodes/TextView';
import Hash from './nodes/Hash';
import Compound from './nodes/Compound';
import Sidebar from './Sidebar';
import { W3CProvider, useW3C } from './W3CContext';


const nodeTypes = {
  textInput: TextInputNode,
  textView: TextViewNode,
  hash: Hash,
  compound: Compound,
};

let id = 0;
const getId = () => `w3cnode_${id++}`;

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

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { in: '', out: '' },
      };
 
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes, type],
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