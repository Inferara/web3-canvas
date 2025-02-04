import React from "react";
import {
  NodeProps,
  Handle,
  Position,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import { KeyPairNodeProps } from "../web3/KeyPair";

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
  let text = "";
  if (inputConnections) {
    if (nodesData?.type === "keypair") {
      const sourceHandle = inputConnections[0]?.sourceHandle;
      if (sourceHandle === "publicKey") {
        text = nodesData ? Utf8DataTransfer.decodeString((nodesData as KeyPairNodeProps).data.out?.publicKey as string) : "";
      } else if (sourceHandle === "privateKey") {
        text = nodesData ? Utf8DataTransfer.decodeString((nodesData as KeyPairNodeProps).data.out?.privateKey as string) : "";
      } else if (sourceHandle === "address") {
        text = nodesData ? Utf8DataTransfer.decodeString((nodesData as KeyPairNodeProps).data.out?.address as string) : "";
      }

    } else {
      text = nodesData ? Utf8DataTransfer.decodeString(nodesData?.data.out as string) : "";
    }
  }

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
