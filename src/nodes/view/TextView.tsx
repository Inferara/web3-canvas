import React from "react";
import {
  NodeProps,
  Handle,
  Position,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import W3CNode from "../../W3CNode";

interface TextViewNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string;
    label?: string;
  };
}

const DEFAULT_LABEL = "View";

const TextViewNode: React.FC<TextViewNodeProps> = ({id, data}) => {
  const inputConnections = useNodeConnections({
    handleType: 'target',
  });
  const nodeData = useNodesData(inputConnections[0]?.source);
  let text = "";
  if (inputConnections) {
    text = Utf8DataTransfer.tryDecodeString(nodeData, inputConnections[0]?.source);
  }

  // If data.label is empty (or null), use the default.
  const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

  return (
    <W3CNode id={id} label={headerLabel} isResizeable={true} isGood={text.length > 0} minHeight={130}>
      <textarea value={text || "..."} readOnly={true} className="nodrag"/>
      <Handle type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0}/>
      <button onClick={() => {navigator.clipboard.writeText(text)}}>📋</button>
    </W3CNode>
  );
};

const MemoizedTextViewNode = React.memo(TextViewNode);
export default MemoizedTextViewNode;
