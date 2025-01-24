import React, { useEffect, useState } from "react";
import {
  NodeProps,
  Handle,
  Position,
  useReactFlow,
} from "@xyflow/react";
import Web3 from "web3";

interface KeyPairNodeProps extends NodeProps {
  id: string;
  data: {
    // Not used in this example, but included for consistency
    in?: string;
    // Web3's account address (public)
    publicKey?: string;
    // Web3's account private key (secret)
    privateKey?: string;
  };
}

const KeyPairNode: React.FC<KeyPairNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();

  // Local states for address (publicKey) and privateKey
  const [publicKey, setPublicKey] = useState<string>(data.publicKey ?? "");
  const [privateKey, setPrivateKey] = useState<string>(data.privateKey ?? "");

  // We'll create a local web3 instance. (No provider needed for account creation)
  const web3 = new Web3();

  // Generate an Ethereum-style account if none exists in data
  useEffect(() => {
    if (!publicKey || !privateKey) {
      const account = web3.eth.accounts.create();
      setPublicKey(account.address);
      setPrivateKey(account.privateKey);

      // Update in React Flow data so other nodes can consume them
      updateNodeData(id, {
        ...data,
        publicKey: account.address,
        privateKey: account.privateKey,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If data changes externally (like reloading), sync local state
  useEffect(() => {
    if (data.publicKey && data.publicKey !== publicKey) {
      setPublicKey(data.publicKey);
    }
    if (data.privateKey && data.privateKey !== privateKey) {
      setPrivateKey(data.privateKey);
    }
  }, [data.publicKey, data.privateKey, publicKey, privateKey]);

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
        style={{ top: "40%" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="privateKey"
        style={{ top: "60%" }}
      />
    </div>
  );
};

export default KeyPairNode;
