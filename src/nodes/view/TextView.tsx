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

  const ids: string[] = [];
  if (inputConnections.length > 0) {
    inputConnections.forEach((connection) => {
      ids.push(connection.source);
    });
  }

  const nodesData = useNodesData(ids);
  let combinedText = "";
  if (nodesData.length > 0) {
    nodesData.forEach((nodeData) => {
      combinedText += Utf8DataTransfer.decodeString(nodeData.data.out as string);
    });
  }
  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 150 }}>
      <div style={{ marginTop: 8 }}>
        {combinedText || "No input connected"}
      </div>
      {/* Single handle for accepting input */}
      <Handle type="target" position={Position.Left} id="input" />
    </div>
  );
};

export default TextViewNode;
