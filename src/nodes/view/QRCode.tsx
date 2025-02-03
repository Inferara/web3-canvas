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
  const nodesData = useNodesData(inputConnections[0]?.source);
  const qrValue = nodesData ? Utf8DataTransfer.decodeString(nodesData?.data.out as string) : "";

  return (
    <div style={{ padding: 8, border: "1px solid #ccc" }}>
      {qrValue ? (
        <QRCode value={qrValue} size={128} />
      ) : (
        <p>No input connected</p>
      )}

      {/* Single handle to accept connections, no source handle since it has no output */}
      <Handle type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0} />
    </div>
  );
};

const MemoizedQrCodeNode = React.memo(QrCodeNode);
export default MemoizedQrCodeNode;
