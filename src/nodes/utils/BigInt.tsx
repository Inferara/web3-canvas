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

interface BigIntNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string;
  };
}

const BigIntNode: React.FC<BigIntNodeProps> = ({ id }) => {
    const { updateNodeData } = useReactFlow();
    const inputConnections = useNodeConnections({ handleType: 'target' });
    let bigIntValue = "";
    const nodeData = useNodesData(inputConnections[0]?.source);
    if (nodeData) {
      let nodeDataValue = "";
      if (nodeData?.type === "keypair") {
        nodeDataValue = Utf8DataTransfer.readStringFromKeyPairNode(nodeData as KeyPairNodeProps,  inputConnections[0]?.sourceHandle as string);
      } else {
        nodeDataValue = (nodeData ? Utf8DataTransfer.decodeString(nodeData?.data.out as string) : "");
      }
      bigIntValue = BigInt(nodeDataValue).toString();
    }
  
    useEffect(() => {
      const newOut = Utf8DataTransfer.encodeString(bigIntValue);
      updateNodeData(id, { out: newOut });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bigIntValue]);
  
  
    return (
      <W3CNode id={id} label="Big Int" isGood={inputConnections.length > 0}>
        <div>{bigIntValue.substring(0, 15) + "..." || "..."}</div>
        <LabeledHandle label="in" type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0}/>
        <LabeledHandle label="big int" type="source" position={Position.Right} id="output" />
      </W3CNode>
    );
  };

export default BigIntNode;
