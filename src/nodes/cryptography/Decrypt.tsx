import React, { useEffect, useState } from "react";
import {
  NodeProps,
  Handle,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import EthCrypto from "eth-crypto";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import { KeyPairNodeProps } from "./KeyPair";
import LabeledHandle from "../../LabeledHandle";

interface DecryptNodeProps extends NodeProps {
  id: string;
  data: {
    in?: object;
    out?: string;
  };
}

const Decrypt: React.FC<DecryptNodeProps> = ({ id }) => {
  const { updateNodeData } = useReactFlow();
  const inputConnections = useNodeConnections({ handleType: "target" });

  // Look for a connection on the "cipher" handle (ciphertext input).
  const cipherConnection = inputConnections.find(
    (conn) => conn.targetHandle === "cipher"
  );
  // Look for a connection on the "privKey" handle (private key).
  const privKeyConnection = inputConnections.find(
    (conn) => conn.targetHandle === "privKey"
  );

  // Retrieve data from the connected nodes.
  const cipherNodeData = useNodesData(cipherConnection?.source as string);
  const privKeyNodeData = useNodesData(privKeyConnection?.source as string);

  // Decode the incoming ciphertext and private key.
  const ciphertext = cipherNodeData
    ? Utf8DataTransfer.decodeStringFromMaybeKeyPairNode(cipherNodeData as KeyPairNodeProps, cipherConnection?.sourceHandle as string)
    : "";
  const privateKey = privKeyNodeData
    ? Utf8DataTransfer.decodeStringFromMaybeKeyPairNode(privKeyNodeData as KeyPairNodeProps, privKeyConnection?.sourceHandle as string)
    : "";

  const [plaintext, setPlaintext] = useState<string>("");

  useEffect(() => {
    const decryptData = async () => {
      if (ciphertext && privateKey) {
        try {
          const plain = await EthCrypto.decryptWithPrivateKey(privateKey, EthCrypto.cipher.parse(ciphertext));
          if (plain) {
            setPlaintext(plain);
            updateNodeData(id, { out: Utf8DataTransfer.encodeString(plain) });
          } else {
            setPlaintext("Decryption failed");
            updateNodeData(id, {
              out: Utf8DataTransfer.encodeString("Decryption failed"),
            });
          }
        } catch (error) {
          console.error("Decryption error:", error);
          setPlaintext("Error");
          updateNodeData(id, { out: Utf8DataTransfer.encodeString("Error") });
        }
      } else {
        setPlaintext("");
        updateNodeData(id, { out: Utf8DataTransfer.encodeString("") });
      }
    };

    decryptData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ciphertext, privateKey]);

  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 250 }}>
      <div>Decrypt Node</div>
      <p style={{ marginTop: 8 }}>
        <strong>Decrypted Message:</strong>
        <br />
        <span style={{ wordWrap: "break-word" }}>
          {plaintext || "No input"}
        </span>
      </p>
      {/* Target handle for ciphertext */}
      <LabeledHandle
        type="target"
        title="Ciphertext"
        position={Position.Left}
        id="cipher"
        style={{ top: "30%" }}
        isConnectable={
          inputConnections.filter((conn) => conn.targetHandle === "cipher").length === 0
        }
      />
      {/* Target handle for private key */}
      <LabeledHandle
        title="Private Key"
        type="target"
        position={Position.Left}
        id="privKey"
        style={{ top: "60%" }}
        isConnectable={
          inputConnections.filter((conn) => conn.targetHandle === "privKey").length === 0
        }
      />
      {/* Source handle for decrypted plaintext */}
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
};

export default Decrypt;
