import React, { useEffect, useState } from "react";
import {
    NodeProps,
    Position,
    useReactFlow,
    useNodeConnections,
    useNodesData,
} from "@xyflow/react";
import { JsonRpcProvider, formatEther } from "ethers";
import LabeledHandle from "../../common/LabeledHandle";
import { Utf8DataTransfer } from "../../utils/Utf8DataTransfer";
import W3CNode from "../../common/W3CNode";

interface EthBalanceNodeProps extends NodeProps {
    id: string;
    data: {
        in?: object;
        out?: string;
        label?: string;
    };
}

const DEFAULT_LABEL = "ETH Balance";

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
        ? Utf8DataTransfer.tryDecodeString(addrNodeData, addrConnection?.sourceHandle)
        : "";
    const providerUrl = urlNodeData
        ? Utf8DataTransfer.tryDecodeString(urlNodeData, urlConnection?.sourceHandle)
        : "https://1rpc.io/linea";

    // Local state to keep track of the fetched balance.
    const [balance, setBalance] = useState<string>("");

    async function fetchBalance() {
        if (address && providerUrl) {
            try {
                const provider = new JsonRpcProvider(providerUrl);
                const balanceWei = await provider.getBalance(address);
                const balanceEther = formatEther(balanceWei);
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

    // If data.label is empty (or null), use the default.
    const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

    return (
        <W3CNode id={id} label={headerLabel} isGood={balance !== "Error" && !isNaN(Number(balance))}>
            <div>{balance || "..."}</div>
            <button onClick={onRefreshButtonClick}>Refresh</button>

            <LabeledHandle
                label="address"
                type="target"
                position={Position.Left}
                id="addr"
                style={{ top: "50%" }}
                isConnectable={
                    inputConnections.filter((conn) => conn.targetHandle === "addr").length === 0
                }
            />

            <LabeledHandle
                label="provider utl"
                type="target"
                position={Position.Left}
                id="url"
                style={{ top: "80%" }}
                isConnectable={
                    inputConnections.filter((conn) => conn.targetHandle === "url")
                        .length === 0
                }
            />

            <LabeledHandle label="out" type="source" position={Position.Right} id="output" />
        </W3CNode>
    );
};

export default EthBalanceNode;
