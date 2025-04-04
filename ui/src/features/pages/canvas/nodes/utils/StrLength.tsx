import React, { useEffect } from "react";
import {
  NodeProps,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";

import { Utf8DataTransfer } from "../../utils/Utf8DataTransfer";
import W3CNode from "../../common/W3CNode";
import LabeledHandle from "../../common/LabeledHandle";


interface StrLengthNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string; // Not used here, but included for consistency
    label?: string;
  };
}

const DEFAULT_LABEL = "Length";

const StrLengthNode: React.FC<StrLengthNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const inputConnections = useNodeConnections({ handleType: 'target' });
  let lengthValue = 0;
  const nodeData = useNodesData(inputConnections[0]?.source);
  if (nodeData) {
    lengthValue = Utf8DataTransfer.tryDecodeString(nodeData, inputConnections[0]?.sourceHandle).length;
  }

  useEffect(() => {
    const newOut = Utf8DataTransfer.encodeNumber(lengthValue);
    updateNodeData(id, { out: newOut });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lengthValue]);

  // If data.label is empty (or null), use the default.
  const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

  return (
    <W3CNode id={id} label={headerLabel} isGood={inputConnections.length > 0}>
      <div>{lengthValue || "..."}</div>
      <LabeledHandle label="in" type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0}/>
      <LabeledHandle label="len" type="source" position={Position.Right} id="output" />
    </W3CNode>
  );
};

export default StrLengthNode;
