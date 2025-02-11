import React, { useEffect, useState } from "react";
import {
  NodeProps,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import EthCrypto from "eth-crypto";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import { KeyPairNodeProps } from "./KeyPair";
import LabeledHandle from "../../LabeledHandle";
import W3CNode from "../../W3CNode";

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
    <W3CNode id={id} label="Decrypt" isGood={plaintext.length > 0}>
      <div>{plaintext.substring(0, 25) + "..." || "..."}</div>
      <LabeledHandle
        type="target"
        side="left"
        label="chipher"
        position={Position.Left}
        id="cipher"
        style={{ top: "50%" }}
        isConnectable={
          inputConnections.filter((conn) => conn.targetHandle === "cipher").length === 0
        }
      />
      {/* Target handle for private key */}
      <LabeledHandle
        label="priv key"
        type="target"
        side="left"
        position={Position.Left}
        id="privKey"
        style={{ top: "80%" }}
        isConnectable={
          inputConnections.filter((conn) => conn.targetHandle === "privKey").length === 0
        }
      />
      {/* Source handle for decrypted plaintext */}
      <LabeledHandle label="out" side="right" type="source" position={Position.Right} id="output" />
    </W3CNode>
  );
};

export default Decrypt;
