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

interface VerifySignatureNodeProps extends NodeProps {
  id: string;
  data: {
    out?: string; // "Valid" or "Invalid"
  };
}

const VerifySignatureNode: React.FC<VerifySignatureNodeProps> = ({ id, data }) => {
  const edges = useEdges();
  const nodes = useNodes();
  const { updateNodeData } = useReactFlow();

  const [verification, setVerification] = useState(data.out ?? "");

  // Filter edges connecting to this node
  const incomingEdges = edges.filter((edge) => edge.target === id);

  let messageInput = "";
  let signatureInput = "";
  let addressInput = "";

  incomingEdges.forEach((edge) => {
    const handleId = edge.targetHandle; // e.g. "msg", "sig", "addr"
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const sourceOut = sourceNode?.data?.out ?? "";

    if (handleId === "msg") {
      messageInput = sourceOut as string;
    } else if (handleId === "sig") {
      signatureInput = sourceOut as string;
    } else if (handleId === "addr") {
      addressInput = sourceOut as string;
    }
  });

  useEffect(() => {
    // If we have message, signature, and address, attempt to verify
    if (messageInput && signatureInput && addressInput) {
      try {
        const web3 = new Web3();
        const recoveredAddress = web3.eth.accounts.recover(messageInput, signatureInput);
        const isValid = recoveredAddress.toLowerCase() === addressInput.toLowerCase();

        const result = isValid ? "Valid" : "Invalid";
        if (result !== verification) {
          setVerification(result);
          updateNodeData(id, { ...data, out: result });
        }
      } catch (err) {
        console.error("Error verifying signature:", err);
        // If error, mark as "Invalid"
        if (verification !== "Invalid") {
          setVerification("Invalid");
          updateNodeData(id, { ...data, out: "Invalid" });
        }
      }
    } else {
      // If we lack any input, clear the verification
      if (verification) {
        setVerification("");
        updateNodeData(id, { ...data, out: "" });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageInput, signatureInput, addressInput]);

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

      {/* Single source handle for the verification result ("Valid" or "Invalid") */}
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
};

export default VerifySignatureNode;
