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
    label?: string;
  };
}

const DEFAULT_LABEL = "QR Code";

const QrCodeNode: React.FC<QrCodeNodeProps> = ({id, data}) => {
  const inputConnections = useNodeConnections({
    handleType: 'target',
  });
  const nodesData = useNodesData(inputConnections[0]?.source);
  const qrValue = nodesData ? Utf8DataTransfer.decodeString(nodesData?.data.out as string) : "";

  // If data.label is empty (or null), use the default.
  const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

  return (
    <W3CNode id={id} label={headerLabel} isResizeable={true} isGood={qrValue.length > 0} minWidth={300} minHeight={150} >
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
