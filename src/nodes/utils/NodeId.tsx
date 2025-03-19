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

interface NodeIdNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string;
    label?: string;
  };
}

const DEFAULT_LABEL = "Node ID";

const NodeIdNode: React.FC<NodeIdNodeProps> = ({ id, data }) => {
    const { updateNodeData } = useReactFlow();
    const inputConnections = useNodeConnections({ handleType: 'target' });
    let nodeId = "";
    const nodeData = useNodesData(inputConnections[0]?.source);
    if (nodeData) {
        nodeId = nodeData.id;
    }
  
    useEffect(() => {
      const newOut = Utf8DataTransfer.encodeString(nodeId);
      updateNodeData(id, { out: newOut });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodeId]);

    // If data.label is empty (or null), use the default.
    const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

    return (
      <W3CNode id={id} label={headerLabel} isGood={inputConnections.length > 0}>
        <div>{nodeId}</div>
        <LabeledHandle label="in" type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0}/>
        <LabeledHandle label="id" type="source" position={Position.Right} id="output" />
      </W3CNode>
    );
  };

export default NodeIdNode;
