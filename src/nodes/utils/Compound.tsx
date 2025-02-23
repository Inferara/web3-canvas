import React, { useEffect } from 'react';
import {
  NodeProps,
  Position,
  useNodeConnections,
  useNodesData,
  useReactFlow,
} from '@xyflow/react';
import { Utf8DataTransfer } from '../../Utf8DataTransfer';
import { KeyPairNodeProps } from '../cryptography/KeyPair';
import W3CNode from '../../W3CNode';
import LabeledHandle from '../../LabeledHandle';

interface CompoundNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string;
    label?: string;
  };
}

const DEFAULT_LABEL = "Compound";

const Compound: React.FC<CompoundNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const inputConnections = useNodeConnections({ handleType: 'target' });
  let combinedData = "";

  const ids = [];
  for (let i = 0; i < inputConnections.length; i++) {
    ids.push(inputConnections[i]?.source);
  }

  const nodesData = useNodesData(ids);

  for (let i = 0; i < nodesData.length; i++) {
    const nodeData = nodesData[i];
    combinedData += Utf8DataTransfer.decodeStringFromMaybeKeyPairNode(nodeData as KeyPairNodeProps, inputConnections[i]?.sourceHandle as string);
    combinedData = combinedData.replace(/\s/g, '');
  }

  useEffect(() => {
    const newOut = Utf8DataTransfer.encodeString(combinedData);
    updateNodeData(id, { out: newOut });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combinedData]);

  // If data.label is empty (or null), use the default.
  const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

  return (
    <W3CNode label={headerLabel} id={id} isGood={combinedData.length > 0}>
      <div>{combinedData.substring(0, 25) + "..." || "..."}</div>
      <LabeledHandle label="in" type="target" position={Position.Left} id="input" />
      <LabeledHandle label="out" type="source" position={Position.Right} id="output" />
    </W3CNode>
  );
};

export default Compound;
