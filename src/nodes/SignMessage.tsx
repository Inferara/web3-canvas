import React, { useEffect, useState } from "react";
import {
  NodeProps,
  Handle,
  Position,
  useEdges,
  useNodes,
  useReactFlow,
} from "@xyflow/react";
import Web3 from "web3";

interface SignMessageNodeProps extends NodeProps {
  id: string;
  data: {
    // We'll store the generated signature in out
    out?: string;

    // (Optional) saved inputs or metadata
    message?: string;
    privateKey?: string;
  };
}

const SignMessageNode: React.FC<SignMessageNodeProps> = ({ id, data }) => {
  const edges = useEdges();
  const nodes = useNodes();
  const { updateNodeData } = useReactFlow();

  const [signature, setSignature] = useState(data.out ?? "");

  // 1) Filter edges to find connections into this node, on specific handle IDs
  const incomingEdges = edges.filter((edge) => edge.target === id);

  // 2) For each handle, see if we have a message or a private key
  let messageInput = "";
  let privateKeyInput = "";

  incomingEdges.forEach((edge) => {
    const handleId = edge.targetHandle; // e.g. "msg" or "privKey"
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const sourceOut = sourceNode?.data?.out ?? "";

    if (handleId === "msg") {
      messageInput = sourceOut;
    } else if (handleId === "privKey") {
      privateKeyInput = sourceOut;
    }
  });

  useEffect(() => {
    // If we have both a message and privateKey, sign
    if (messageInput && privateKeyInput) {
      try {
        const web3 = new Web3();
        const account = web3.eth.accounts.privateKeyToAccount(privateKeyInput);
        // Sign the message
        const { signature: newSignature } = account.sign(messageInput);
        if (newSignature !== signature) {
          setSignature(newSignature);
          // Update node data so other nodes can read the signature
          updateNodeData(id, { ...data, out: newSignature });
        }
      } catch (err) {
        console.error("Error signing message:", err);
      }
    } else {
      // If either input is missing, clear the signature
      if (signature) {
        setSignature("");
        updateNodeData(id, { ...data, out: "" });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageInput, privateKeyInput]);

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
      <Handle type="target" position={Position.Left} id="msg" style={{ top: "30%" }} />
      <Handle type="target" position={Position.Left} id="privKey" style={{ top: "60%" }} />

      {/* Single source handle to output the signature */}
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
};

export default SignMessageNode;
