import React from "react";
import {
  NodeProps,
  Handle,
  Position,
  useNodes,
  useEdges,
} from "@xyflow/react";

interface ColorViewNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;   // Not used, but present for consistency
    out?: number[];  // Not used here, as this node doesn't produce output
  };
}

const ColorViewNode: React.FC<ColorViewNodeProps> = ({ id }) => {
  // Access the full graph of nodes and edges
  const nodes = useNodes();
  const edges = useEdges();

  // 1) Find edges that connect *to* this node's "input" handle
  const incomingEdges = edges.filter(
    (edge) => edge.target === id && edge.targetHandle === "input"
  );

  // 2) Extract the 'out' from each connected source node
  //    We’ll use the last connected color (if multiple)
  const colorValues = incomingEdges.map((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const colorBytes = (sourceNode?.data?.out as number[]) ?? [];
    const segmentLength = Math.ceil(colorBytes.length / 3);
    const segments = [
      colorBytes.slice(0, segmentLength),
      colorBytes.slice(segmentLength, segmentLength * 2),
      colorBytes.slice(segmentLength * 2, segmentLength * 3),
    ];

    const hexColor = segments
      .map((segment) => {
        const sum = segment.reduce((acc, byte) => acc + byte, 0);
        const normalized = Math.floor((sum / segment.length) % 256);
        return normalized.toString(16).padStart(2, "0");
      })
      .join("");
    return `#${hexColor}`;
    
  });

  // 3) The color to display: last color or fallback
  const color = colorValues[colorValues.length - 1] || "#ccc";

  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 150 }}>
      <div>Color View Node</div>
      <div style={{ marginTop: 8 }}>
        <div
          style={{
            width: 60,
            height: 60,
            backgroundColor: color,
            border: "1px solid #333",
          }}
        />
        <p style={{ marginTop: 4 }}>{color}</p>
      </div>
      {/* One handle for input, no output handle since it just displays data */}
      <Handle type="target" position={Position.Left} id="input" />
    </div>
  );
};

export default ColorViewNode;
