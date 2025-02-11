import React from "react";
import {
  NodeProps,
  Position,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import { ethers } from 'ethers';
import { KeyPairNodeProps } from "./KeyPair";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import LabeledHandle from "../../LabeledHandle";
import W3CNode from "../../W3CNode";

interface VerifySignatureNodeProps extends NodeProps {
  id: string;
  data: {
    in?: object,
    out?: string;
  };
}

const VerifySignatureNode: React.FC<VerifySignatureNodeProps> = ({id}) => {
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
        addressInput = Utf8DataTransfer.readStringFromKeyPairNode(addrNodeData as KeyPairNodeProps,  addrConnection.sourceHandle as string);
      } else {
        addressInput = Utf8DataTransfer.decodeString(addrNodeData?.data.out as string);
      }
    }
    if (messageInput && signatureInput && addressInput) {
      try {
        const recoveredAddress = ethers.utils.verifyMessage(messageInput, signatureInput);
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
    <W3CNode id={id} label="Verify Signature" isGood={verification === "✅"}>
      <div>{verification}</div>
      {/* Three target handles: message, signature, address */}
      <LabeledHandle label="message" type="target" side="left" position={Position.Left} id="msg" style={{ top: "50%" }} isConnectable={inputConnections.filter((conn) => conn.targetHandle === "msg").length === 0} />
      <LabeledHandle label="signature" type="target" side="left" position={Position.Left} id="sig" style={{ top: "70%" }} isConnectable={inputConnections.filter((conn) => conn.targetHandle === "sig").length === 0}/>
      <LabeledHandle label="address" type="target" side="left" position={Position.Left} id="addr" style={{ top: "90%" }} isConnectable={inputConnections.filter((conn) => conn.targetHandle === "addr").length === 0}/>
    </W3CNode>
  );
};

export default VerifySignatureNode;
