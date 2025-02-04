import React, { useEffect } from 'react';
import {
  Handle,
  NodeProps,
  Position,
  useNodeConnections,
  useNodesData,
  useReactFlow,
} from '@xyflow/react';
import { Utf8DataTransfer } from '../../Utf8DataTransfer';
import { KeyPairNodeProps } from '../web3/KeyPair';

interface CompoundNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string;
  };
}

const Compound: React.FC<CompoundNodeProps> = ({ id }) => {
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
    if (nodeData.type === "keypair") {
      const sourceHandle = inputConnections[0]?.sourceHandle;
      if (sourceHandle === "publicKey") {
        combinedData += nodesData ? Utf8DataTransfer.decodeString((nodeData as KeyPairNodeProps).data.out?.publicKey as string) : "";
      } else if (sourceHandle === "privateKey") {
        combinedData += nodesData ? Utf8DataTransfer.decodeString((nodeData as KeyPairNodeProps).data.out?.privateKey as string) : "";
      } else if (sourceHandle === "address") {
        combinedData += nodesData ? Utf8DataTransfer.decodeString((nodeData as KeyPairNodeProps).data.out?.address as string) : "";
      }
    } else {
      combinedData += nodesData ? Utf8DataTransfer.decodeString(nodeData.data.out as string) : "";
    }
    combinedData = combinedData.replace(/\s/g, '');
  }

  useEffect(() => {
    const newOut = Utf8DataTransfer.encodeString(combinedData);
    updateNodeData(id, { out: newOut });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combinedData]);

  return (
    <div style={{ padding: 8, border: "1px solid #ccc" }}>
      <div>{combinedData || "No input"}</div>

      {/* Single handle to accept multiple connections */}
      <Handle type="target" position={Position.Left} id="input" />

      {/* One source handle for the combined output */}
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
};

export default Compound;
