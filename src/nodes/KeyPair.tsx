import React, { useEffect } from "react";
import {
  NodeProps,
  Handle,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import Web3 from "web3";

import { Utf8DataTransfer } from "../Utf8DataTransfer";

interface KeyPairNodeProps extends NodeProps {
  id: string;
  data: {
    // Not used in this example, but included for consistency
    in?: string;
    out?: {
      publicKey?: string;
      privateKey?: string;
      address?: string;
    }
  };
}

const KeyPairNode: React.FC<KeyPairNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const inputConnections = useNodeConnections({
    handleType: 'target',
  });
  const nodesData = useNodesData(inputConnections[0]?.source);
  const web3 = new Web3();
  const privateKey = nodesData ? Utf8DataTransfer.unpack(nodesData?.data.out as string) as string : "";
  const account = privateKey ? web3.eth.accounts.privateKeyToAccount(privateKey) : null;
  const publicKey = privateKey && account ? web3.eth.accounts.privateKeyToPublicKey(account.privateKey, false): "";
  const address = privateKey && account ? account.address : "";

  useEffect(() => {
    if (privateKey) {
      updateNodeData(id, {
        ...data,
          out: {
            privateKey: Utf8DataTransfer.encodeString(account?.privateKey as string),
            publicKey: Utf8DataTransfer.encodeString(publicKey),
            address: Utf8DataTransfer.encodeString(address)
          }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [privateKey]);

  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 220 }}>
      <div>Ethereum KeyPair Node (Web3.js)</div>
      <p style={{ marginTop: 8 }}>
        <strong>Public Address:</strong>
        <br />
        <span>{publicKey || "Generating..."}</span>
      </p>
      <p style={{ marginTop: 8 }}>
        <strong>Private Key:</strong>
        <br />
        <span>{privateKey || "Generating..."}</span>
      </p>
      {/* One target handle for optional upstream data (e.g. a seed), if needed */}
      <Handle type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0}/>

      {/* Two source handles for publicKey and privateKey */}
      <Handle
        type="source"
        position={Position.Right}
        id="publicKey"
        style={{ top: "30%" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="privateKey"
        style={{ top: "60%" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="address"
        style={{ top: "90%" }}
      />
    </div>
  );
};

export default KeyPairNode;
