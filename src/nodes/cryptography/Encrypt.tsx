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

interface EncryptNodeProps extends NodeProps {
    id: string;
    data: {
        in?: object;
        out?: string;
    };
}

const Encrypt: React.FC<EncryptNodeProps> = ({ id }) => {
    const { updateNodeData } = useReactFlow();
    // Retrieve input connections.
    const inputConnections = useNodeConnections({ handleType: "target" });

    // Look for a connection on the "msg" handle (plaintext message).
    const msgConnection = inputConnections.find(
        (conn) => conn.targetHandle === "msg"
    );
    // Look for a connection on the "pubKey" handle (public key).
    const pubKeyConnection = inputConnections.find(
        (conn) => conn.targetHandle === "pubKey"
    );

    // Retrieve data from the connected nodes.
    const msgNodeData = useNodesData(msgConnection?.source as string);
    const pubKeyNodeData = useNodesData(pubKeyConnection?.source as string);

    // Decode the incoming plaintext and public key.
    const message = msgNodeData
        ? Utf8DataTransfer.decodeStringFromMaybeKeyPairNode(msgNodeData as KeyPairNodeProps, msgConnection?.sourceHandle as string)
        : "";
    const publicKey = pubKeyNodeData
        ? Utf8DataTransfer.decodeStringFromMaybeKeyPairNode(pubKeyNodeData as KeyPairNodeProps, pubKeyConnection?.sourceHandle as string)
        : "";

    const [ciphertext, setCiphertext] = useState<string>("");
    let ecnryptionError = "";

    async function encrypt() {
        if (!message || !publicKey) {
            updateNodeData(id, { out: Utf8DataTransfer.encodeString("") });
            return;
        }
        try {
            const encrypted = await EthCrypto.encryptWithPublicKey(publicKey.substring(2), message);
            const strEncrypted = EthCrypto.cipher.stringify(encrypted);
            setCiphertext(strEncrypted);
            updateNodeData(id, { out: Utf8DataTransfer.encodeString(strEncrypted) });
        } catch (error) {
            ecnryptionError = String(error);
        }
    }

    useEffect(() => {
        encrypt();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [message, publicKey]);

    return (
        <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 250 }}>
            <div>Encrypt Node</div>
            <p style={{ marginTop: 8 }}>
                <strong>Ciphertext:</strong>
                <br />
                <span style={{ wordWrap: "break-word" }}>
                    {(ciphertext || ecnryptionError) || "No input"}
                </span>
            </p>
            {/* Target handle for plaintext message */}
            <LabeledHandle
                label="Message"
                type="target"
                position={Position.Left}
                id="msg"
                style={{ top: "30%" }}
                isConnectable={
                    inputConnections.filter((conn) => conn.targetHandle === "msg").length === 0
                }
            />
            {/* Target handle for public key */}
            <LabeledHandle
                label="Public Key"
                type="target"
                position={Position.Left}
                id="pubKey"
                style={{ top: "60%" }}
                isConnectable={
                    inputConnections.filter((conn) => conn.targetHandle === "pubKey").length === 0
                }
            />
            {/* Source handle for encrypted ciphertext */}
            <Handle type="source" position={Position.Right} id="output" />
        </div>
    );
};

export default Encrypt;
