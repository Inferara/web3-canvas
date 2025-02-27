import React, { useEffect, useState } from "react";
import {
    NodeProps,
    Position,
    useReactFlow,
    useNodeConnections,
    useNodesData,
} from "@xyflow/react";
import LabeledHandle from "../../LabeledHandle";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import W3CNode from "../../W3CNode";

interface MakeActorMessageProps extends NodeProps {
    id: string;
    data: {
        in?: object;
        out?: string;
    };
}

interface ActorMessage {
    from: string;
    to: string;
    amount: number;
}

const MakeActorMessage: React.FC<MakeActorMessageProps> = ({ id, data }) => {
    const { updateNodeData } = useReactFlow();
    const inputConnections = useNodeConnections({ handleType: "target" });

    const fromConnection = inputConnections.find((conn) => conn.targetHandle === "from");
    const toConnection = inputConnections.find((conn) => conn.targetHandle === "to");
    const amtConnection = inputConnections.find((conn) => conn.targetHandle === "amt");
    
    const fromNodeData = useNodesData(fromConnection?.source as string);
    const toNodeData = useNodesData(toConnection?.source as string);
    const amtNodeData = useNodesData(amtConnection?.source as string);

    const fromAddress = fromNodeData ? Utf8DataTransfer.tryDecodeString(fromNodeData, fromConnection?.sourceHandle) : "";
    const toAddress = toNodeData ? Utf8DataTransfer.tryDecodeString(toNodeData, toConnection?.sourceHandle) : "";
    const amtStr = amtNodeData ? Utf8DataTransfer.tryDecodeString(amtNodeData, amtConnection?.sourceHandle) : "";
    const amount = parseFloat(amtStr);

    const [message, setMessage] = useState<ActorMessage>({ from: "", to: "", amount: 0 });

    useEffect(() => {
        if (fromAddress && toAddress && !isNaN(amount)) {
            setMessage({ from: fromAddress, to: toAddress, amount });
            updateNodeData(id, { ...data, out: Utf8DataTransfer.encodeString(JSON.stringify(message)) });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromAddress, toAddress, amtStr]);

    function sendMessage() {

    }

    return (
        <W3CNode id={id} label="Make Transaction" isGood={message !== undefined && message.from !== "" && message.to !== "" && message.amount !== 0}>

            <LabeledHandle
                label="from"
                type="target"
                position={Position.Left}
                id="from"
                style={{ top: "50%" }}
                isConnectable={inputConnections.filter((conn) => conn.targetHandle === "from").length === 0}
            />

            <LabeledHandle
                label="to"
                type="target"
                position={Position.Left}
                id="to"
                style={{ top: "75%" }}
                isConnectable={inputConnections.filter((conn) => conn.targetHandle === "to").length === 0}
            />

            <LabeledHandle
                label="amount"
                type="target"
                position={Position.Left}
                id="amt"
                style={{ top: "90%" }}
                isConnectable={inputConnections.filter((conn) => conn.targetHandle === "amt").length === 0}
            />

            <button onClick={sendMessage}>Send</button>
        </W3CNode>
    );
};

export default MakeActorMessage;
