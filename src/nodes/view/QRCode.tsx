import React from "react";
import {
  Handle,
  NodeProps,
  Position,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import QRCode from "react-qr-code";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";

interface QrCodeNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string; // not used, but present for consistency
  };
}

const QrCodeNode: React.FC<QrCodeNodeProps> = () => {
  const inputConnections = useNodeConnections({
    handleType: 'target',
  });

  const ids: string[] = [];
  if (inputConnections.length > 0) {
    inputConnections.forEach((connection) => {
      ids.push(connection.source);
    });
  }

  const nodesData = useNodesData(ids);
  let qrValue = "";
  if (nodesData.length > 0) {
    qrValue = nodesData
      .map((nodeData) => Utf8DataTransfer.decodeString(nodeData.data.out as string))
      .join("");
  }

  // // This node doesn't store or update an 'out' value; it only *consumes* data.

  // useEffect(() => {
  //   // 1) Identify edges that connect *to* this node's handle "input"
  //   const incomingEdges = edges.filter(
  //     (edge) => edge.target === id && edge.targetHandle === "input"
  //   );

  //   // 2) Concatenate all 'out' values from the connected source nodes
  //   const combinedInput = incomingEdges
  //     .map((edge) => {
  //       const sourceNode = nodes.find((n) => n.id === edge.source);
  //       // Fallback to empty string if source node or out is undefined
  //       return sourceNode?.data?.out ?? "";
  //     })
  //     .join("");

  //   // 3) Update local state with the new input
  //   setQrValue(combinedInput);
  // }, [id, nodes, edges]);

  return (
    <div style={{ padding: 8, border: "1px solid #ccc" }}>
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
