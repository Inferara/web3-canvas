import React from "react";
import {
  NodeProps,
  Handle,
  Position,
  useNodes,
  useEdges,
} from "@xyflow/react";

import { Utf8DataTransfer } from "../Utf8DataTransfer";


interface LengthViewNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string; // Not used here, but included for consistency
  };
}

const LengthViewNode: React.FC<LengthViewNodeProps> = ({ id }) => {
  // Access all nodes and edges in the React Flow
  const nodes = useNodes();
  const edges = useEdges();

  // 1) Get all edges that connect into this node's handle "input"
  const incomingEdges = edges.filter(
    (edge) => edge.target === id && edge.targetHandle === "input"
  );

  // 2) Gather and concatenate the 'out' value from each connected source node
  const lengthValue = incomingEdges
    .map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      return (Utf8DataTransfer.decodeString(sourceNode?.data?.out as string) ?? []).length;
    }).reduce((acc, curr) => acc + curr, 0);

  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 150 }}>
      <div>Length Node</div>
      <div style={{ marginTop: 8 }}>{lengthValue}</div>
      {/* Single handle to accept input; no output since it's just displaying a value */}
      <Handle type="target" position={Position.Left} id="input" />
    </div>
  );
};

export default LengthViewNode;
