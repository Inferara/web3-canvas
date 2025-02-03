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

interface SignMessageNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string;
  };
}

const SignMessageNode: React.FC<SignMessageNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const inputConnections = useNodeConnections({ handleType: 'target' });
  let signature = "";
  const nd1 = useNodesData(inputConnections[0]?.source);
  const nd2 = useNodesData(inputConnections[1]?.source);

  if (nd1 && nd2) {
    const message = Utf8DataTransfer.decodeString((inputConnections[0].targetHandle === "msg" ? nd1.data.out : nd2.data.out) as string);
    const privateKey = Utf8DataTransfer.decodeString(data.in as string);
    const web3 = new Web3();
    const signResult = web3.eth.accounts.sign(message, privateKey);
    signature = signResult.signature;
  }

  useEffect(() => {
    updateNodeData(id, { ...data, out: Utf8DataTransfer.encodeString(signature) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);


  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 220 }}>
      <div>Sign Message Node</div>

      <p style={{ marginTop: 8 }}>
        <strong>Signature:</strong>
        <br />
        <span style={{ wordWrap: "break-word" }}>
          {signature || "No signature"}
        </span>
      </p>

      {/* Two target handles: one for the message, one for the private key */}
      <Handle type="target" position={Position.Left} id="msg" style={{ top: "30%" }} isConnectable={inputConnections.filter((conn) => conn.targetHandle === "msg").length === 0} />
      <Handle type="target" position={Position.Left} id="privKey" style={{ top: "60%" }} isConnectable={inputConnections.filter((conn) => { conn.targetHandle === "privKey" }).length === 0} />

      {/* Single source handle to output the signature */}
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
};

export default SignMessageNode;
