import React, { useEffect, useState } from "react";
import {
    NodeProps,
    Position,
    useReactFlow,
    useNodeConnections,
    useNodesData,
} from "@xyflow/react";
import { encrypt, PublicKey } from "eciesjs";
import { Utf8DataTransfer } from "../../utils/Utf8DataTransfer";
import LabeledHandle from "../../common/LabeledHandle";
import W3CNode from "../../common/W3CNode";

interface EncryptNodeProps extends NodeProps {
    id: string;
    data: {
        in?: object;
        out?: string;
        label?: string;
    };
}

const DEFAULT_LABEL = "Encrypt";

const Encrypt: React.FC<EncryptNodeProps> = ({ id, data }) => {
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
        ? Utf8DataTransfer.tryDecodeString(msgNodeData, msgConnection?.sourceHandle)
        : "";
    const publicKey = pubKeyNodeData
        ? Utf8DataTransfer.tryDecodeString(pubKeyNodeData, pubKeyConnection?.sourceHandle)
        : "";

    const [ciphertext, setCiphertext] = useState<string>("");

    useEffect(() => {
        if (!message || !publicKey) return;
        const encrypted = encrypt(PublicKey.fromHex(publicKey).toBytes(), Buffer.from(message, 'utf-8'));
        const strEncrypted = encrypted.toString('hex');
        setCiphertext(strEncrypted);
        updateNodeData(id, { out: Utf8DataTransfer.encodeString(strEncrypted) });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [message, publicKey]);

    // If data.label is empty (or null), use the default.
    const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

    return (
        <W3CNode id={id} label={headerLabel} isGood={ciphertext.length > 0}>
            <div>{ciphertext.substring(0, 25) + "..." || "..."}</div>
            <div>{ciphertext ? ("Chipertext length: " + ciphertext.length) : ""}</div>            
            <LabeledHandle
                label="msg"
                type="target"
                position={Position.Left}
                id="msg"
                style={{ top: "50%" }}
                isConnectable={
                    inputConnections.filter((conn) => conn.targetHandle === "msg").length === 0
                }
            />
            <LabeledHandle
                label="pub key"
                type="target"
                position={Position.Left}
                id="pubKey"
                style={{ top: "80%" }}
                isConnectable={
                    inputConnections.filter((conn) => conn.targetHandle === "pubKey").length === 0
                }
            />
            <LabeledHandle label="out" type="source" position={Position.Right} id="output" isConnectable={true} />
        </W3CNode>
    );
};

export default Encrypt;
