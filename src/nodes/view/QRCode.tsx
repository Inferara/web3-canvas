import React from "react";
import {
  NodeProps,
  Position,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import QRCode from "react-qr-code";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import W3CNode from "../../W3CNode";
import LabeledHandle from "../../LabeledHandle";

interface QrCodeNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string; // not used, but present for consistency
  };
}

const QrCodeNode: React.FC<QrCodeNodeProps> = ({id}) => {
  const inputConnections = useNodeConnections({
    handleType: 'target',
  });
  const nodesData = useNodesData(inputConnections[0]?.source);
  const qrValue = nodesData ? Utf8DataTransfer.decodeString(nodesData?.data.out as string) : "";

  return (
    <W3CNode id={id} label="QR Code" isRezieable={true} isGood={qrValue.length > 0} minWidth={300} minHeight={150} >
      {qrValue ? (
        <QRCode value={qrValue} size={128} />
      ) : (
        <div>...</div>
      )}

      {/* Single handle to accept connections, no source handle since it has no output */}
      <LabeledHandle label="in" type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0} />
    </W3CNode>
  );
};

const MemoizedQrCodeNode = React.memo(QrCodeNode);
export default MemoizedQrCodeNode;
