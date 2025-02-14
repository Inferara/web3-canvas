import React, { useEffect, useState } from "react";
import {
    NodeProps,
    Position,
    useReactFlow,
    useNodeConnections,
    useNodesData,
} from "@xyflow/react";
import { encrypt, PublicKey } from "eciesjs";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import { KeyPairNodeProps } from "./KeyPair";
import LabeledHandle from "../../LabeledHandle";
import W3CNode from "../../W3CNode";

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

    useEffect(() => {
        if (!message || !publicKey) return;
        const encrypted = encrypt(PublicKey.fromHex(publicKey).toBytes(), Buffer.from(message, 'utf-8'));
        const strEncrypted = encrypted.toString('hex');
        setCiphertext(strEncrypted);
        updateNodeData(id, { out: Utf8DataTransfer.encodeString(strEncrypted) });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [message, publicKey]);

    return (
        <W3CNode id={id} label="Encrypt" isGood={ciphertext.length > 0}>
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
