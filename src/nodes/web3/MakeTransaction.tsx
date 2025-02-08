import React, { useEffect, useState } from "react";
import {
    NodeProps,
    Handle,
    Position,
    useReactFlow,
    useNodeConnections,
    useNodesData,
} from "@xyflow/react";
import { ethers } from "ethers";
import LabeledHandle from "../../LabeledHandle";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import { KeyPairNodeProps } from "../cryptography/KeyPair";

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
    const gasPriceConnection = inputConnections.find((conn) => conn.targetHandle === "gasPrice");

    const privKeyNodeData = useNodesData(privKeyConnection?.source as string);
    const fromNodeData = useNodesData(fromConnection?.source as string);
    const toNodeData = useNodesData(toConnection?.source as string);
    const amtNodeData = useNodesData(amtConnection?.source as string);
    const gasPriceNodeData = useNodesData(gasPriceConnection?.source as string);

    // Decode the inputs using Utf8DataTransfer.
    const privateKey = privKeyNodeData ? Utf8DataTransfer.decodeStringFromMaybeKeyPairNode(privKeyNodeData as KeyPairNodeProps, privKeyConnection?.sourceHandle as string) : "";
    const fromAddress = fromNodeData ? Utf8DataTransfer.decodeStringFromMaybeKeyPairNode(fromNodeData as KeyPairNodeProps, fromConnection?.sourceHandle as string) : "";
    const toAddress = toNodeData ? Utf8DataTransfer.decodeStringFromMaybeKeyPairNode(toNodeData as KeyPairNodeProps, toConnection?.sourceHandle as string) : "";
    const amtStr = amtNodeData ? Utf8DataTransfer.decodeStringFromMaybeKeyPairNode(amtNodeData as KeyPairNodeProps, amtConnection?.sourceHandle as string) : "";
    const amount = parseFloat(amtStr);
    const gasPriceStr = gasPriceNodeData ? Utf8DataTransfer.decodeStringFromMaybeKeyPairNode(gasPriceNodeData as KeyPairNodeProps, gasPriceConnection?.sourceHandle as string) : "0.07";

    const [signedTx, setSignedTx] = useState<string>("");

    useEffect(() => {
        async function createSignedTransaction() {
            if (privateKey && fromAddress && toAddress && !isNaN(amount)) {
                try {
                    const provider = new ethers.providers.JsonRpcProvider("https://linea.drpc.org");
                    const wallet = new ethers.Wallet(privateKey);
                    const nonce = await provider.getTransactionCount(wallet.address);
                    const transaction: ethers.providers.TransactionRequest = {
                        from: fromAddress,
                        to: toAddress,
                        value: ethers.utils.parseEther(amtStr),
                        gasLimit: ethers.utils.hexlify(21000),
                        gasPrice: ethers.utils.parseUnits(gasPriceStr, 'gwei'),
                        nonce: nonce,
                        chainId: 59144,  // Linea
                    };
                    const signed = await wallet.signTransaction(transaction);
                    setSignedTx(signed || "");
                    updateNodeData(id, { out: Utf8DataTransfer.encodeString(signed || "") });
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
                label="privKey"
                type="target"
                position={Position.Left}
                id="privKey"
                style={{ top: "15%" }}
                isConnectable={inputConnections.filter((conn) => conn.targetHandle === "privKey").length === 0}
            />
            {/* Target handle for "from" address */}
            <LabeledHandle
                label="From"
                type="target"
                position={Position.Left}
                id="from"
                style={{ top: "35%" }}
                isConnectable={inputConnections.filter((conn) => conn.targetHandle === "from").length === 0}
            />
            {/* Target handle for "to" address */}
            <LabeledHandle
                label="To"
                type="target"
                position={Position.Left}
                id="to"
                style={{ top: "55%" }}
                isConnectable={inputConnections.filter((conn) => conn.targetHandle === "to").length === 0}
            />
            {/* Target handle for transfer amount (ETH) */}
            <LabeledHandle
                label="Amount"
                type="target"
                position={Position.Left}
                id="amt"
                style={{ top: "75%" }}
                isConnectable={inputConnections.filter((conn) => conn.targetHandle === "amt").length === 0}
            />
            <LabeledHandle
                label="gas price"
                type="target"
                position={Position.Left}
                id="gasPrice"
                style={{ top: "90%" }}
                isConnectable={inputConnections.filter((conn) => conn.targetHandle === "gasPrice").length === 0}
            />
            {/* Source handle to output the signed transaction */}
            <Handle type="source" position={Position.Right} id="output" />
        </div>
    );
};

export default MakeTransactionNode;
