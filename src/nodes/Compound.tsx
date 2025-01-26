import React, { useEffect, useState } from 'react';
import {
  Handle,
  NodeProps,
  Position,
  useReactFlow,
  useNodes,
  useEdges,
} from '@xyflow/react';

interface CompoundNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string;
  };
}

const Compound: React.FC<CompoundNodeProps> = ({ id }) => {
  // Hooks to read the entire graph
  const nodes = useNodes();       // All nodes in the flow
  const edges = useEdges();       // All edges in the flow
  const { updateNodeData } = useReactFlow(); // Update data on this node

  // Local state to store the combined output
  const [combinedData, setCombinedData] = useState("");

  useEffect(() => {
    // 1) Identify edges that connect *to* this node's handle "input"
    const incomingEdges = edges.filter(
      (edge) => edge.target === id && edge.targetHandle === "input"
    );

    // 2) Gather 'out' data from each source node
    const outputs = incomingEdges.map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      return (sourceNode?.data?.out as number[]) ?? [];
    });

    // 3) Combine all outputs (customize the join logic as you wish)
    const newData = outputs.join();

    // 4) Update the local state and also update this node's out data in React Flow
    if (newData !== combinedData) {
      setCombinedData(newData);
      const utf8Encoder = new TextEncoder();
      const newOut = utf8Encoder.encode(newData);
      updateNodeData(id, { out: newOut });
    }
  }, [edges, nodes, id, combinedData, updateNodeData]);

  return (
    <div style={{ padding: 8, border: "1px solid #ccc" }}>
      <div>{combinedData || "No input"}</div>

      {/* Single handle to accept multiple connections */}
      <Handle type="target" position={Position.Left} id="input" />

      {/* One source handle for the combined output */}
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
};

export default Compound;
