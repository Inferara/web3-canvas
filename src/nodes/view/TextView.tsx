import React from "react";
import {
  NodeProps,
  Handle,
  Position,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";

interface TextViewNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string;
  };
}

const TextViewNode: React.FC<TextViewNodeProps> = () => {
  const inputConnections = useNodeConnections({
    handleType: 'target',
  });
  const nodesData = useNodesData(inputConnections[0]?.source);
  const text = nodesData ? Utf8DataTransfer.decodeString(nodesData?.data.out as string) : "";

  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 150 }}>
      <div style={{ marginTop: 8 }}>
        {text || "No input connected"}
      </div>
      {/* Single handle for accepting input */}
      <Handle type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0}/>
    </div>
  );
};

const MemoizedTextViewNode = React.memo(TextViewNode);
export default MemoizedTextViewNode;
