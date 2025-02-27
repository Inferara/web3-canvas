import React, { useEffect } from "react";
import {
  NodeProps,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import { computeAddress, keccak256, SigningKey } from 'ethers';
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import W3CNode from "../../W3CNode";
import LabeledHandle from "../../LabeledHandle";

export interface KeyPairNodeProps extends NodeProps {
  id: string;
  data: {
    in?: object;
    out?: {
      publicKey?: string;
      privateKey?: string;
      address?: string;
    };
    label?: string;
  };
}

const DEFAULT_LABEL = "KeyPair";

const KeyPairNode: React.FC<KeyPairNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();

  // Detect input connections (e.g., receiving a private key from another node)
  const inputConnections = useNodeConnections({ handleType: 'target' });
  const nodesData = useNodesData(inputConnections[0]?.source);

  // Detect output connections (which nodes are connected to which handles)
  const outputConnections = useNodeConnections({ handleType: 'source' });

  let privateKey = nodesData ? Utf8DataTransfer.tryDecodeString(nodesData, inputConnections[0]?.sourceHandle) : "";
  if (privateKey && !privateKey.startsWith("0x")) {
    const encoder = new TextEncoder();
    privateKey = keccak256(encoder.encode(privateKey));
  }
  const signingKey = privateKey ? new SigningKey(privateKey) : undefined;
  const publicKey = signingKey ? signingKey.publicKey : "";
  const address = signingKey ? computeAddress(signingKey) : "";

  useEffect(() => {
    const pkOut = Utf8DataTransfer.encodeString(privateKey);
    const pubOut = Utf8DataTransfer.encodeString(publicKey);
    const addrOut = Utf8DataTransfer.encodeString(address);
    updateNodeData(id, { ...data, out: { privateKey: pkOut, publicKey: pubOut, address: addrOut } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [privateKey, outputConnections.length]);

  // If data.label is empty (or null), use the default.
  const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

  return (
    <W3CNode id={id} label={headerLabel} isGood={publicKey.length > 0} style={{ width: 300 }}>
      <div>{publicKey.substring(0, 20) + "..." || "..."}</div>
      <div>{address.substring(0, 20) + "..." || "..."}</div>
      {/* {inputConnections.length === 0 && <div><button onClick={generateKeyPair}>Generate</button></div>} */}

      <LabeledHandle
        label="in"
        type="target"
        position={Position.Left}
        id="input"
        isConnectable={inputConnections.length === 0}
      />

      <LabeledHandle
        label="pub key"
        type="source"
        position={Position.Right}
        id="publicKey"
        style={{ top: "50%" }}
      />
      <LabeledHandle
        label="priv key"
        type="source"
        position={Position.Right}
        id="privateKey"
        style={{ top: "70%" }}
      />
      <LabeledHandle
        label="address"
        type="source"
        position={Position.Right}
        id="address"
        style={{ top: "90%" }}
      />
    </W3CNode>
  );
};

export default KeyPairNode;
