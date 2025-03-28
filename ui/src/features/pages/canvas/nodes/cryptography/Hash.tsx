import React, { useEffect } from 'react';
import {
  NodeProps,
  Position,
  useNodeConnections,
  useNodesData,
  useReactFlow,
} from '@xyflow/react';
import { keccak256, toUtf8Bytes, isHexString } from 'ethers';

import { Utf8DataTransfer } from "../../utils/Utf8DataTransfer";
import LabeledHandle from '../../common/LabeledHandle';
import W3CNode from '../../common/W3CNode';

interface HashNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string;
    label?: string;
  };
}

const DEFAULT_LABEL = "Hash";

const Hash: React.FC<HashNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const inputConnections = useNodeConnections({
    handleType: 'target',
  });
  const nodeData = useNodesData(inputConnections[0]?.source);
  let computedHash  = "";
  if (nodeData) {
    let hashInput = Utf8DataTransfer.tryDecodeString(nodeData, inputConnections[0]?.sourceHandle);
    computedHash = isHexString(hashInput) ? keccak256(hashInput) : keccak256(toUtf8Bytes(hashInput));
  }
  useEffect(() => {
    const newOut = Utf8DataTransfer.encodeString(computedHash);
    updateNodeData(id, { out: newOut });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedHash]);

  // If data.label is empty (or null), use the default.
  const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

  return (
    <W3CNode id={id} label={headerLabel} isGood={computedHash.length === 66}>
      <div>{computedHash.substring(0, 25) + "..." || "..."}</div>
      <div>{computedHash ? ("Hash length: " + computedHash.length) : ""}</div>
      {/* Single target handle that can accept multiple connections */}
      <LabeledHandle label="in" type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0} />
      {/* Source handle to expose the computed hash */}
      <LabeledHandle label="out" type="source" position={Position.Right} id="output" isConnectable={true}/>
    </W3CNode>
  );
};

export default Hash;
