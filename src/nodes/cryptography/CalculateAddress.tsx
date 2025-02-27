import React, { useEffect } from 'react';
import {
  NodeProps,
  Position,
  useNodeConnections,
  useNodesData,
  useReactFlow,
} from '@xyflow/react';
import { keccak256 } from 'ethers';
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import LabeledHandle from '../../LabeledHandle';
import W3CNode from '../../W3CNode';

interface CalculateAddressNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string;
    label?: string;
  };
}

const DEFAULT_LABEL = "Calculate Address";

const CalculateAddress: React.FC<CalculateAddressNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const inputConnections = useNodeConnections({
    handleType: 'target',
  });
  const nodeData = useNodesData(inputConnections[0]?.source);
  let computedAddress  = "";
  if (nodeData) {
    let pubKeyInput = Utf8DataTransfer.tryDecodeString(nodeData, inputConnections[0]?.sourceHandle);
    computedAddress = keccak256("0x" + pubKeyInput.substring(4)).substring(26);
  }
  useEffect(() => {
    const newOut = Utf8DataTransfer.encodeString(computedAddress);
    updateNodeData(id, { out: newOut });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedAddress]);

  // If data.label is empty (or null), use the default.
  const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

  return (
    <W3CNode id={id} label={headerLabel} isGood={computedAddress.length === 40}>
      <div>{computedAddress.substring(0, 25) + "..." || "..."}</div>
      <div>{computedAddress ? ("Address length: " + computedAddress.length) : ""}</div>
      {/* Single target handle that can accept multiple connections */}
      <LabeledHandle label="in" type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0} />
      {/* Source handle to expose the computed hash */}
      <LabeledHandle label="out" type="source" position={Position.Right} id="output" isConnectable={true}/>
    </W3CNode>
  );
};

export default CalculateAddress;
