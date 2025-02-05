import React, { useEffect, useState } from "react";
import {
    NodeProps,
    Handle,
    Position,
    useReactFlow,
    useNodeConnections,
    useNodesData,
} from "@xyflow/react";
import Web3 from "web3";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import LabeledHandle from "../../LabeledHandle";
import { KeyPairNodeProps } from "./KeyPair";

interface MakeTransactionNodeProps extends NodeProps {
    id: string;
    data: {
        in?: object;
        out?: string;
    };
}

const MakeTransactionNode: React.FC<MakeTransactionNodeProps> = ({ id }) => {
    const { updateNodeData } = useReactFlow();
    const inputConnections = useNodeConnections({ handleType: "target" });

    // Retrieve each input by its handle id.
    const privKeyConnection = inputConnections.find((conn) => conn.targetHandle === "privKey");
    const fromConnection = inputConnections.find((conn) => conn.targetHandle === "from");
    const toConnection = inputConnections.find((conn) => conn.targetHandle === "to");
    const amtConnection = inputConnections.find((conn) => conn.targetHandle === "amt");

    const privKeyNodeData = useNodesData(privKeyConnection?.source as string);
    const fromNodeData = useNodesData(fromConnection?.source as string);
    const toNodeData = useNodesData(toConnection?.source as string);
    const amtNodeData = useNodesData(amtConnection?.source as string);

    // Decode the inputs using Utf8DataTransfer.
    const privateKey = privKeyNodeData ? Utf8DataTransfer.readStringFromMaybeKeyPairNode(privKeyNodeData as KeyPairNodeProps, privKeyConnection?.sourceHandle as string) : "";
    const fromAddress = fromNodeData ? Utf8DataTransfer.readStringFromMaybeKeyPairNode(fromNodeData as KeyPairNodeProps, fromConnection?.sourceHandle as string) : "";
    const toAddress = toNodeData ? Utf8DataTransfer.readStringFromMaybeKeyPairNode(toNodeData as KeyPairNodeProps, toConnection?.sourceHandle as string) : "";
    const amtStr = amtNodeData ? Utf8DataTransfer.readStringFromMaybeKeyPairNode(amtNodeData as KeyPairNodeProps, amtConnection?.sourceHandle as string) : "";
    const amount = parseFloat(amtStr);

    const [signedTx, setSignedTx] = useState<string>("");

    useEffect(() => {
        async function createSignedTransaction() {
            if (privateKey && fromAddress && toAddress && !isNaN(amount)) {
                try {
                    const web3 = new Web3();
                    // Construct a minimal transaction object.
                    // In production, you must supply the correct nonce, gasPrice, and chainId.
                    const tx = {
                        from: fromAddress,
                        to: toAddress,
                        value: web3.utils.toWei(amtStr, "ether"),
                        gas: 21000,
                        gasPrice: web3.utils.toWei("10", "gwei"),
                        nonce: 0,    // Dummy nonce; replace with the actual nonce in production.
                        chainId: 1,  // Mainnet; adjust for your target network.
                    };
                    const signed = await web3.eth.accounts.signTransaction(tx, privateKey);
                    setSignedTx(signed.rawTransaction || "");
                    updateNodeData(id, { out: Utf8DataTransfer.encodeString(signed.rawTransaction || "") });
                } catch (error) {
                    console.error("Error signing transaction:", error);
                    setSignedTx("Error");
                    updateNodeData(id, { out: Utf8DataTransfer.encodeString("Error") });
                }
            } else {
                // Clear the output if not all inputs are provided.
                setSignedTx("");
                updateNodeData(id, { out: Utf8DataTransfer.encodeString("") });
            }
        }
        createSignedTransaction();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [privateKey, fromAddress, toAddress, amtStr]);

    return (
        <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 250 }}>
            <div>Make Transaction Node</div>
            <p style={{ marginTop: 8 }}>
                <strong>Signed Transaction:</strong>
                <br />
                <span style={{ wordWrap: "break-word" }}>{signedTx || "Not ready"}</span>
            </p>

            {/* Target handle for private key input */}

            <LabeledHandle
                title="privKey"
                type="target"
                position={Position.Left}
                id="privKey"
                style={{ top: "15%" }}
                isConnectable={inputConnections.filter((conn) => conn.targetHandle === "privKey").length === 0}
            />
            {/* Target handle for "from" address */}
            <LabeledHandle
                title="From"
                type="target"
                position={Position.Left}
                id="from"
                style={{ top: "35%" }}
                isConnectable={inputConnections.filter((conn) => conn.targetHandle === "from").length === 0}
            />
            {/* Target handle for "to" address */}
            <LabeledHandle
                title="To"
                type="target"
                position={Position.Left}
                id="to"
                style={{ top: "55%" }}
                isConnectable={inputConnections.filter((conn) => conn.targetHandle === "to").length === 0}
            />
            {/* Target handle for transfer amount (ETH) */}
            <LabeledHandle
                title="Amount"
                type="target"
                position={Position.Left}
                id="amt"
                style={{ top: "75%" }}
                isConnectable={inputConnections.filter((conn) => conn.targetHandle === "amt").length === 0}
            />
            {/* Source handle to output the signed transaction */}
            <Handle type="source" position={Position.Right} id="output" />
        </div>
    );
};

export default MakeTransactionNode;
