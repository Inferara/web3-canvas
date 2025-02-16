import React, { useEffect } from "react";
import {
  NodeProps,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";

import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import { KeyPairNodeProps } from "../cryptography/KeyPair";
import W3CNode from "../../W3CNode";
import LabeledHandle from "../../LabeledHandle";


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
    <W3CNode id={id} label="Length" isGood={inputConnections.length > 0}>
      <div>{lengthValue || "..."}</div>
      <LabeledHandle label="in" type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0}/>
      <LabeledHandle label="len" type="source" position={Position.Right} id="output" />
    </W3CNode>
  );
};

export default StrLengthNode;
