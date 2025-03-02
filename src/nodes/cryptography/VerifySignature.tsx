import React from "react";
import {
  NodeProps,
  Position,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import { verifyMessage } from 'ethers';
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import LabeledHandle from "../../LabeledHandle";
import W3CNode from "../../W3CNode";

interface VerifySignatureNodeProps extends NodeProps {
  id: string;
  data: {
    in?: object,
    out?: string;
    label?: string;
  };
}

const DEFAULT_LABEL = "Verify Signature";

const VerifySignatureNode: React.FC<VerifySignatureNodeProps> = ({ id, data }) => {
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
    const msgNodeData = nodesData.find((nd) => nd.id === msgConnection?.source);
    messageInput = Utf8DataTransfer.tryDecodeString(msgNodeData, msgConnection?.sourceHandle);
    const sigConnection = inputConnections.find((conn) => conn.targetHandle === "sig");
    const sigNodeData = nodesData.find((nd) => nd.id === sigConnection?.source);
    signatureInput = Utf8DataTransfer.tryDecodeString(sigNodeData, sigConnection?.sourceHandle);
    const addrConnection = inputConnections.find((conn) => conn.targetHandle === "addr");
    const addrNodeData = nodesData.find((nd) => nd.id === addrConnection?.source);
    if (addrConnection) {
      addressInput = Utf8DataTransfer.tryDecodeString(addrNodeData, addrConnection?.sourceHandle);
    }
    if (messageInput && signatureInput && addressInput) {
      try {
        const recoveredAddress = verifyMessage(messageInput, signatureInput);
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

  // If data.label is empty (or null), use the default.
  const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

  return (
    <W3CNode id={id} label={headerLabel} isGood={verification === "✅"}>
      <div>{verification}</div>
      {/* Three target handles: message, signature, address */}
      <LabeledHandle label="message" type="target" position={Position.Left} id="msg" style={{ top: "50%" }} isConnectable={inputConnections.filter((conn) => conn.targetHandle === "msg").length === 0} />
      <LabeledHandle label="signature" type="target" position={Position.Left} id="sig" style={{ top: "70%" }} isConnectable={inputConnections.filter((conn) => conn.targetHandle === "sig").length === 0} />
      <LabeledHandle label="address" type="target" position={Position.Left} id="addr" style={{ top: "90%" }} isConnectable={inputConnections.filter((conn) => conn.targetHandle === "addr").length === 0} />
    </W3CNode>
  );
};

export default VerifySignatureNode;
