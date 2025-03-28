import React, { useEffect } from 'react';
import {
  NodeProps,
  Position,
  useNodeConnections,
  useNodesData,
  useReactFlow,
} from '@xyflow/react';
import { Utf8DataTransfer } from '../../utils/Utf8DataTransfer';
import W3CNode from '../../common/W3CNode';
import LabeledHandle from '../../common/LabeledHandle';

interface BigIntNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string;
    label?: string;
  };
}

const DEFAULT_LABEL = "Big Int";

const BigIntNode: React.FC<BigIntNodeProps> = ({ id, data }) => {
    const { updateNodeData } = useReactFlow();
    const inputConnections = useNodeConnections({ handleType: 'target' });
    let bigIntValue = "";
    const nodeData = useNodesData(inputConnections[0]?.source);
    if (nodeData) {
      let nodeDataValue = Utf8DataTransfer.tryDecodeString(nodeData, inputConnections[0]?.sourceHandle);
      bigIntValue = BigInt(nodeDataValue).toString();
    }
  
    useEffect(() => {
      const newOut = Utf8DataTransfer.encodeString(bigIntValue);
      updateNodeData(id, { out: newOut });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bigIntValue]);

    // If data.label is empty (or null), use the default.
    const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

    return (
      <W3CNode id={id} label={headerLabel} isGood={inputConnections.length > 0}>
        <div>{bigIntValue.substring(0, 15) + "..." || "..."}</div>
        <LabeledHandle label="in" type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0}/>
        <LabeledHandle label="big int" type="source" position={Position.Right} id="output" />
      </W3CNode>
    );
  };

export default BigIntNode;
