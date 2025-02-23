import React, { useEffect, useState } from "react";
import {
  NodeProps,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import { PrivateKey, decrypt  } from "eciesjs";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import { KeyPairNodeProps } from "./KeyPair";
import LabeledHandle from "../../LabeledHandle";
import W3CNode from "../../W3CNode";

interface DecryptNodeProps extends NodeProps {
  id: string;
  data: {
    in?: object;
    out?: string;
    label?: string;
  };
}

const DEFAULT_LABEL = "Decrypt";

const Decrypt: React.FC<DecryptNodeProps> = ({ id, data }) => {
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
  const [decrypted, setDecrypted] = useState<boolean>(false);

  useEffect(() => {
    const decryptData = async () => {
      if (ciphertext && privateKey) {
        try {
          let sk = PrivateKey.fromHex(privateKey);
          let plain = decrypt(sk.secret, Buffer.from(ciphertext, 'hex'));
          if (plain) {
            let plainStr = Buffer.from(plain).toString();
            setPlaintext(plainStr);
            setDecrypted(true);
            updateNodeData(id, { out: Utf8DataTransfer.encodeString(plainStr) });
          } else {
            setPlaintext("Decryption failed");
            setDecrypted(false);
            updateNodeData(id, {
              out: Utf8DataTransfer.encodeString("Decryption failed"),
            });
          }
        } catch (error) {
          console.error("Decryption error:", error);
          setDecrypted(false);
          updateNodeData(id, { out: Utf8DataTransfer.encodeString("") });
        }
      } else {
        setPlaintext("");
        updateNodeData(id, { out: Utf8DataTransfer.encodeString("") });
      }
    };

    decryptData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ciphertext, privateKey]);

  // If data.label is empty (or null), use the default.
  const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

  return (
    <W3CNode id={id} label={headerLabel} isGood={decrypted}>
      <div>{plaintext.substring(0, 25) + "..." || "..."}</div>
      <LabeledHandle
        type="target"
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
        position={Position.Left}
        id="privKey"
        style={{ top: "80%" }}
        isConnectable={
          inputConnections.filter((conn) => conn.targetHandle === "privKey").length === 0
        }
      />
      {/* Source handle for decrypted plaintext */}
      <LabeledHandle label="out" type="source" position={Position.Right} id="output" />
    </W3CNode>
  );
};

export default Decrypt;
