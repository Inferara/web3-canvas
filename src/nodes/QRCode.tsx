import React, { useEffect, useState } from "react";
import {
  Handle,
  NodeProps,
  Position,
  useNodes,
  useEdges,
} from "@xyflow/react";
import QRCode from "react-qr-code";

interface QrCodeNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string; // not used, but present for consistency
  };
}

const QrCodeNode: React.FC<QrCodeNodeProps> = ({ id }) => {
  const nodes = useNodes();
  const edges = useEdges();

  // This node doesn't store or update an 'out' value; it only *consumes* data.
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    // 1) Identify edges that connect *to* this node's handle "input"
    const incomingEdges = edges.filter(
      (edge) => edge.target === id && edge.targetHandle === "input"
    );

    // 2) Concatenate all 'out' values from the connected source nodes
    const combinedInput = incomingEdges
      .map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        // Fallback to empty string if source node or out is undefined
        return sourceNode?.data?.out ?? "";
      })
      .join("");

    // 3) Update local state with the new input
    setQrValue(combinedInput);
  }, [id, nodes, edges]);

  return (
    <div style={{ padding: 8, border: "1px solid #ccc" }}>
      <div>QR Code</div>
      {qrValue ? (
        <QRCode value={qrValue} size={128} />
      ) : (
        <p>No input connected</p>
      )}

      {/* Single handle to accept connections, no source handle since it has no output */}
      <Handle type="target" position={Position.Left} id="input" />
    </div>
  );
};

export default QrCodeNode;
