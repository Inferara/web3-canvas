import React, { useState } from 'react';
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

interface HashNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string;
  };
}

const Hash: React.FC<HashNodeProps> = ({id, data}) => {
 const [computedHash, setComputedHash] = useState<string>("");
 const { updateNodeData } = useReactFlow();

 const inputConnections = useNodeConnections({
    handleType: 'target',
  });

  const ids: string[] = [];
  if (inputConnections.length > 0) {
    inputConnections.forEach((connection) => {
      ids.push(connection.source);
    });
  }

  const nodesData = useNodesData(ids);
  if (nodesData.length > 0) {
    const combinedInput = nodesData.map((nodeData) => 
      Utf8DataTransfer.unpack(nodeData.data.out as string)
    ).join("");
    const newHash = web3.utils.keccak256Wrapper(combinedInput);
    setComputedHash(newHash);
    const newOut = Utf8DataTransfer.encodeString(newHash);
    if (newOut !== data.out) {
      updateNodeData(id, { out: newOut });
    }
  }



  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 150 }}>
      <div style={{ marginTop: 8 }}>
        {computedHash.substring(0, 30) + "..." || "No input connected"}
      </div>
      {/* Single target handle that can accept multiple connections */}
      <Handle type="target" position={Position.Left} id="input" />
      {/* Source handle to expose the computed hash */}
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
};

export default Hash;
