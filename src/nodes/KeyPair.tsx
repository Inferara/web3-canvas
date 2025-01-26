import React, { useEffect, useState } from "react";
import {
  NodeProps,
  Handle,
  Position,
  useReactFlow,
  useNodes,
  useEdges,
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
  const nodes = useNodes();
  const edges = useEdges();
  const { updateNodeData } = useReactFlow();

  // Local states for address (publicKey) and privateKey
  const [privateKey, setPrivateKey] = useState<string>(data.out?.privateKey ?? "");
  const [publicKey, setPublicKey] = useState<string>(data.out?.publicKey ?? "");
  const [address, setAddress] = useState<string>(data.out?.address ?? "");

  // We'll create a local web3 instance. (No provider needed for account creation)
  const web3 = new Web3();

  // Generate an Ethereum-style account if none exists in data
  useEffect(() => {
    const incomingEdges = edges.filter(
      (edge) => edge.target === id && edge.targetHandle === "input"
    );
    
    let privateKey = "";
    if (incomingEdges.length == 1) {
      const edge = incomingEdges[0];
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (sourceNode?.data?.out) {
        privateKey = Utf8DataTransfer.unpack(sourceNode.data.out as string) as string;
      }
    }

    if (privateKey) {
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      const publicKey = web3.eth.accounts.privateKeyToPublicKey(account.privateKey, false);
      setPublicKey(publicKey);
      setPrivateKey(account.privateKey);
      setAddress(account.address);

      // Update in React Flow data so other nodes can consume them
      updateNodeData(id, {
        ...data,
        publicKey: publicKey,
        privateKey: account.privateKey,
      });
      setPrivateKey(account.privateKey);
      setPublicKey(publicKey);
      setAddress(account.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, nodes, edges, privateKey,publicKey, address, updateNodeData]);


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
      <Handle type="target" position={Position.Left} id="input" />

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
