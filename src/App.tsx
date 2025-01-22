import { useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  NodeChange,
  EdgeChange,
  Connection,
  Edge, Node 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import TextInputNode from './nodes/TextInput';
import TextViewNode from './nodes/TextView';
import HashNode from './nodes/HashNode';

const initialNodes: Node[] = [
  {
    id: 'node-1',
    type: 'textInput',
    position: { x: 0, y: 0 },
    data: { in: "123", out: "" },
  },
  {
    id: 'node-2',
    type: 'textView',
    position: { x: 150, y: 0 },
    data: { in: "", out: "" },
  },
  {
    id: 'node-3',
    type: 'hash',
    position: { x: 300, y: 0 },
    data: { in: "", out: "" },
  },
];

const initialEdges: Edge[] = [];
const nodeTypes = {
  textInput: TextInputNode,
  textView: TextViewNode,
  hash: HashNode,
};

const Flow: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  return (
    <div style={{ height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default Flow;
