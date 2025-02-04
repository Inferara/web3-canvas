import React from "react";
import {
  NodeProps,
  Handle,
  Position,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import Web3 from "web3";
import { KeyPairNodeProps } from "./web3/KeyPair";
import { Utf8DataTransfer } from "../Utf8DataTransfer";

interface VerifySignatureNodeProps extends NodeProps {
  id: string;
  data: {
    in?: object,
    out?: string;
  };
}

const VerifySignatureNode: React.FC<VerifySignatureNodeProps> = () => {
  const inputConnections = useNodeConnections({ handleType: 'target' });
  let messageInput = "";
  let signatureInput = "";
  let addressInput = "";
  let verification = "⌛";
  const nd1 = useNodesData(inputConnections[0]?.source);
  const nd2 = useNodesData(inputConnections[1]?.source);
  const nd3 = useNodesData(inputConnections[2]?.source);

  if (nd1 && nd2 && nd3) {
    const nodesData = [nd1, nd2, nd3];
    const msgConnection = inputConnections.find((conn) => conn.targetHandle === "msg");
    messageInput = Utf8DataTransfer.decodeString(msgConnection ? nodesData.find((nd) => nd.id === msgConnection.source)?.data?.out as string : "");
    const sigConnection = inputConnections.find((conn) => conn.targetHandle === "sig");
    signatureInput = Utf8DataTransfer.decodeString(sigConnection ? nodesData.find((nd) => nd.id === sigConnection.source)?.data?.out as string : "");
    const addrConnection = inputConnections.find((conn) => conn.targetHandle === "addr");
    const addrNodeData = nodesData.find((nd) => nd.id === addrConnection?.source);
    if (addrConnection) {
      if (addrNodeData?.type === "keypair") {
        addressInput = Utf8DataTransfer.decodeString((addrNodeData as KeyPairNodeProps).data.out?.address as string) as string;
      } else {
        addressInput = Utf8DataTransfer.decodeString(addrNodeData?.data.out as string);
      }
    }
    if (messageInput && signatureInput && addressInput) {
      try {
        const web3 = new Web3();
        const recoveredAddress = web3.eth.accounts.recover(messageInput, signatureInput);
        const isValid = recoveredAddress.toLowerCase() === addressInput.toLowerCase();
        verification = isValid ? "✅" : "❌";
      } catch (err) {
        console.error("Error verifying signature:", err);
        verification = "❌";
      }
    } else {
      // If we lack any input, clear the verification
      if (verification) {
        verification = "⌛";
      }
    }
  }

  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 220 }}>
      <div>Verify Signature Node</div>

      <p style={{ marginTop: 8 }}>
        <strong>Verification:</strong>
        <br />
        <span>{verification || "No result"}</span>
      </p>

      {/* Three target handles: message, signature, address */}
      <Handle type="target" position={Position.Left} id="msg" style={{ top: "25%" }} />
      <Handle type="target" position={Position.Left} id="sig" style={{ top: "50%" }} />
      <Handle type="target" position={Position.Left} id="addr" style={{ top: "75%" }} />
    </div>
  );
};

export default VerifySignatureNode;
