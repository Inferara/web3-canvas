import React, { useEffect } from 'react';
import {
  NodeProps,
  Position,
  useNodeConnections,
  useNodesData,
  useReactFlow,
} from '@xyflow/react';
import { ethers } from 'ethers';

import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import { KeyPairNodeProps } from './KeyPair';
import LabeledHandle from '../../LabeledHandle';
import W3CNode from '../../W3CNode';

interface HashNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string;
  };
}

const Hash: React.FC<HashNodeProps> = ({ id }) => {
  const { updateNodeData } = useReactFlow();
  const inputConnections = useNodeConnections({
    handleType: 'target',
  });
  const nodeData = useNodesData(inputConnections[0]?.source);
  let computedHash  = "";
  if (nodeData) {
    let hashInput = "";
    if (nodeData?.type === "keypair") {
      hashInput = Utf8DataTransfer.readStringFromKeyPairNode(nodeData as KeyPairNodeProps,  inputConnections[0]?.sourceHandle as string);
    } else {
      hashInput = nodeData ? Utf8DataTransfer.decodeString(nodeData?.data.out as string) : "";
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: TS2339
    computedHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(hashInput));
  }
  useEffect(() => {
    const newOut = Utf8DataTransfer.encodeString(computedHash);
    updateNodeData(id, { out: newOut });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedHash]);

  return (
    <W3CNode id={id} label="Hash" isGood={computedHash.length === 66}>
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
