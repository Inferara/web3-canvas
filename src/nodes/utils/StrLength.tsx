import React, { useEffect } from "react";
import {
  NodeProps,
  Handle,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";

import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import { KeyPairNodeProps } from "../cryptography/KeyPair";


interface StrLengthNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string; // Not used here, but included for consistency
  };
}

const StrLengthNode: React.FC<StrLengthNodeProps> = ({ id }) => {
  const { updateNodeData } = useReactFlow();
  const inputConnections = useNodeConnections({ handleType: 'target' });
  let lengthValue = 0;
  const nodeData = useNodesData(inputConnections[0]?.source);
  if (nodeData) {
    if (nodeData?.type === "keypair") {
      lengthValue = Utf8DataTransfer.readStringFromKeyPairNode(nodeData as KeyPairNodeProps,  inputConnections[0]?.sourceHandle as string).length;
    } else {
      lengthValue = (nodeData ? Utf8DataTransfer.decodeString(nodeData?.data.out as string) : "").length;
    }
  }

  useEffect(() => {
    const newOut = Utf8DataTransfer.encodeNumber(lengthValue);
    updateNodeData(id, { out: newOut });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lengthValue]);


  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 150 }}>
      <div>{lengthValue || "No input connected"}</div>
      {/* Single handle to accept input; no output since it's just displaying a value */}
      <Handle type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0}/>
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
};

export default StrLengthNode;
