import React from "react";
import {
  NodeProps,
  Handle,
  Position,
  useNodes,
  useEdges,
} from "@xyflow/react";

interface TextViewNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: number[];
  };
}

const TextViewNode: React.FC<TextViewNodeProps> = ({ id }) => {
  // Access all nodes and edges in the current React Flow
  const nodes = useNodes();
  const edges = useEdges();

  // 1) Filter edges that connect to this node's target handle "input"
  const incomingEdges = edges.filter(
    (edge) => edge.target === id && edge.targetHandle === "input"
  );

  // 2) Gather the 'out' data from each connected source node
  const textOutputs = incomingEdges.map((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const utf8Decoder = new TextDecoder();
    const bytes = sourceNode?.data?.out ?? "";
    const encodedText = utf8Decoder.decode(bytes as Uint8Array);
    return encodedText;
  });

  // 3) Concatenate or otherwise combine the incoming text
  const combinedText = textOutputs.join("");

  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 150 }}>
      <div>Text View Node</div>
      <div style={{ marginTop: 8 }}>
        {combinedText || "No input connected"}
      </div>
      {/* Single handle for accepting input */}
      <Handle type="target" position={Position.Left} id="input" />
    </div>
  );
};

export default TextViewNode;
