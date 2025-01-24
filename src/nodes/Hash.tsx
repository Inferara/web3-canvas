import React, { useEffect, useState } from 'react';
import {
  Handle,
  NodeProps,
  Position,
  useEdges,
  useNodes,
  useReactFlow,
} from '@xyflow/react';
import web3 from 'web3';

interface HashNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: number[];
  };
}

const Hash: React.FC<HashNodeProps> = ({ id }) => {
  // Access all nodes and edges in the flow
  const nodes = useNodes();
  const edges = useEdges();
  // Function to update this node's 'out'
  const { updateNodeData } = useReactFlow();

  // Local state to keep track of the computed hash
  const [computedHash, setComputedHash] = useState("");

  useEffect(() => {
    // 1) Find all edges that connect into this node's target handle "input"
    const incomingEdges = edges.filter(
      (edge) => edge.target === id && edge.targetHandle === "input"
    );

    // 2) Gather 'out' data from each connected source node
    const combinedInput = incomingEdges
      .map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        return sourceNode?.data?.out ?? [];
      })
      .join(""); // Concatenate all source outputs

    // 3) If there's no input, reset hash
    if (!combinedInput) {
      if (computedHash !== "") {
        setComputedHash("");
        updateNodeData(id, { out: "" });
      }
      return;
    }

    // 4) Compute the keccak256 hash of the combined input
    const newHash = web3.utils.keccak256Wrapper(combinedInput);
    if (newHash !== computedHash) {
      setComputedHash(newHash);
      const utf8Encoder = new TextEncoder();
      const newOut = utf8Encoder.encode(newHash);
      updateNodeData(id, { out: newOut });
    }
  }, [id, nodes, edges, computedHash, updateNodeData]);

  return (
    <div style={{ padding: 8, border: "1px solid #ccc" }}>
      <div>keccak256</div>
      {/* Single target handle that can accept multiple connections */}
      <Handle type="target" position={Position.Left} id="input" />
      {/* Source handle to expose the computed hash */}
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
};

export default Hash;
