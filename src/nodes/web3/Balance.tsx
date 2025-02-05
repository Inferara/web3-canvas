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
        (conn) => conn.targetHandle === "url"
    );

    // Get the connected nodes' data.
    const addrNodeData = useNodesData(addrConnection?.source as string);
    const urlNodeData = useNodesData(urlConnection?.source as string);

    // Decode the provided address and provider URL.
    const address = addrNodeData
        ? Utf8DataTransfer.decodeString(addrNodeData.data.out as string)
        : "";
    const providerUrl = urlNodeData
        ? Utf8DataTransfer.decodeString(urlNodeData.data.out as string)
        : "";

    // Local state to keep track of the fetched balance.
    const [balance, setBalance] = useState<string>("");

    useEffect(() => {
        async function fetchBalance() {
            if (address && providerUrl) {
                try {
                    // Create a new Web3 instance with the provided URL.
                    const web3 = new Web3(providerUrl);
                    // Get the balance in Wei.
                    const balanceWei = await web3.eth.getBalance(address);
                    // Convert the balance from Wei to Ether.
                    const balanceEther = web3.utils.fromWei(balanceWei, "ether");
                    setBalance(balanceEther);
                    // Update this node's data with the encoded balance.
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
        fetchBalance();
        // The eslint rule is disabled similar to the other nodes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, providerUrl]);

    return (
        <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 250 }}>
            <div>Balance Node</div>
            <p style={{ marginTop: 8 }}>
                <strong>Balance:</strong>
                <br />
                <span>{balance || "No balance"}</span>
            </p>

            {/* Target handle for the blockchain address */}
            <Handle
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
            <Handle
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
