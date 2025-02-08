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

interface EthBalanceNodeProps extends NodeProps {
    id: string;
    data: {
        in?: object;
        out?: string;
    };
}

const EthBalanceNode: React.FC<EthBalanceNodeProps> = ({ id, data }) => {
    const { updateNodeData } = useReactFlow();
    // Get all target connection handles for this node.
    const inputConnections = useNodeConnections({ handleType: "target" });

    // Identify the connection coming into the address and URL handles.
    const addrConnection = inputConnections.find(
        (conn) => conn.targetHandle === "addr"
    );
    const urlConnection = inputConnections.find(
        (conn) => conn.targetHandle === "url" //https://rpc.ankr.com/eth https://eth-sepolia.api.onfinality.io/public
    );

    // Get the connected nodes' data.
    const addrNodeData = useNodesData(addrConnection?.source as string);
    const urlNodeData = useNodesData(urlConnection?.source as string);

    // Decode the provided address and provider URL.
    const address = addrNodeData
        ? Utf8DataTransfer.decodeStringFromMaybeKeyPairNode(addrNodeData as KeyPairNodeProps, addrConnection?.sourceHandle as string)
        : "";
    const providerUrl = urlNodeData
        ? Utf8DataTransfer.decodeStringFromMaybeKeyPairNode(urlNodeData as KeyPairNodeProps, urlConnection?.sourceHandle as string)
        : "https://1rpc.io/linea";

    // Local state to keep track of the fetched balance.
    const [balance, setBalance] = useState<string>("");

    async function fetchBalance() {
        if (address && providerUrl) {
            try {
                const provider = new ethers.providers.JsonRpcProvider(providerUrl);
                const balanceWei = await provider.getBalance(address);
                const balanceEther = ethers.utils.formatEther(balanceWei);
                setBalance(balanceEther);
                updateNodeData(id, {
                    out: Utf8DataTransfer.encodeString(balanceEther),
                });
            } catch (error) {
                console.error("Error fetching balance:", error);
                setBalance("Error");
                updateNodeData(id, { ...data, out: Utf8DataTransfer.encodeString("Error") });
            }
        }
    }

    useEffect(() => {
        fetchBalance();
        // The eslint rule is disabled similar to the other nodes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, providerUrl]);

    const onRefreshButtonClick = () => {
        fetchBalance();
    };

    return (
        <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 250 }}>
            <div>Balance Node</div>
            <p style={{ marginTop: 8 }}>
                <strong>Balance:</strong>
                <br />
                <span>{balance || "No balance"}</span>
                <button onClick={onRefreshButtonClick}>Refresh</button>
            </p>

            {/* Target handle for the blockchain address */}
            <LabeledHandle
                label="address"
                type="target"
                position={Position.Left}
                id="addr"
                style={{ top: "30%" }}
                isConnectable={
                    inputConnections.filter((conn) => conn.targetHandle === "addr")
                        .length === 0
                }
            />

            {/* Target handle for the blockchain provider URL */}
            <LabeledHandle
                label="provider utl"
                type="target"
                position={Position.Left}
                id="url"
                style={{ top: "60%" }}
                isConnectable={
                    inputConnections.filter((conn) => conn.targetHandle === "url")
                        .length === 0
                }
            />

            {/* Source handle to output the balance */}
            <Handle type="source" position={Position.Right} id="output" />
        </div>
    );
};

export default EthBalanceNode;
