import React, { useEffect } from 'react';
import {
  Handle,
  NodeProps,
  Position,
  useNodeConnections,
  useNodesData,
  useReactFlow,
} from '@xyflow/react';
import web3 from 'web3';

import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import { KeyPairNodeProps } from './KeyPair';

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
    computedHash = web3.utils.keccak256Wrapper(hashInput);
  }
  useEffect(() => {
    const newOut = Utf8DataTransfer.encodeString(computedHash);
    updateNodeData(id, { out: newOut });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedHash]);

  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 250 }}>
      <div style={{ marginTop: 8, width: "100%" }}>
        {computedHash.substring(0, 30) + "..." || "No input connected"}
      </div>
      {/* Single target handle that can accept multiple connections */}
      <Handle type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0} />
      {/* Source handle to expose the computed hash */}
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
};

export default Hash;
