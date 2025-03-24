import React, { useState } from "react";
import {
    NodeProps,
    Position,
    useNodeConnections,
    useNodesData,
} from "@xyflow/react";
import LabeledHandle from "../../common/LabeledHandle";
import { Utf8DataTransfer } from "../../utils/Utf8DataTransfer";
import W3CNode from "../../common/W3CNode";
import { W3CMessageQueue, W3CQueueMessage, W3CQueueMessageType } from "../../infrastructure/Queue";

interface MakeActorMessageProps extends NodeProps {
    id: string;
    data: {
        in?: object;
        out?: string;
        label?: string;
    };
}

const DEFAULT_LABEL = "Make Actor Message";

const MakeActorMessage: React.FC<MakeActorMessageProps> = ({ id, data }) => {
    const inputConnections = useNodeConnections({ handleType: "target" });
    const [messageType, setMessageType] = useState<W3CQueueMessageType>(W3CQueueMessageType.Log);

    const fromConnection = inputConnections.find((conn) => conn.targetHandle === "from");
    const toConnection = inputConnections.find((conn) => conn.targetHandle === "to");
    const amtConnection = inputConnections.find((conn) => conn.targetHandle === "amt");
    const delayConnection = inputConnections.find((conn) => conn.targetHandle === "delay");
    
    const fromNodeData = useNodesData(fromConnection?.source as string);
    const toNodeData = useNodesData(toConnection?.source as string);
    const amtNodeData = useNodesData(amtConnection?.source as string);
    const delayNodeData = useNodesData(delayConnection?.source as string);

    const fromAddress = fromNodeData ? Utf8DataTransfer.tryDecodeString(fromNodeData, fromConnection?.sourceHandle) : "";
    const toAddress = toNodeData ? Utf8DataTransfer.tryDecodeString(toNodeData, toConnection?.sourceHandle) : "";
    const amtStr = amtNodeData ? Utf8DataTransfer.tryDecodeString(amtNodeData, amtConnection?.sourceHandle) : "";
    const amount = parseFloat(amtStr);
    const delayStr = delayNodeData ? Utf8DataTransfer.tryDecodeString(delayNodeData, delayConnection?.sourceHandle) : "";
    const delay = parseInt(delayStr);

    function sendMessage() {
        const queue = W3CMessageQueue.getInstance();
        const message: W3CQueueMessage = {
            from: fromAddress ?? id,
            to: [ toAddress],
            payload: amount,
            type: messageType,
            timestamp: new Date().toDateString(),
            delay: delay
        };
        queue.enqueue(message);
    }

    // If data.label is empty (or null), use the default.
    const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

    return (
        <W3CNode id={id} label={headerLabel} isGood={true}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "4px" }}>
                <div>
                    <label>
                        Operation:{" "}
                        <select
                            onChange={(e) => setMessageType(e.target.value as W3CQueueMessageType)}
                            className="nodrag"
                        >
                            {Object.keys(W3CQueueMessageType).map((op) => (
                                <option key={op} value={op}>
                                    {op}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>
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
                style={{ top: "60%" }}
                isConnectable={inputConnections.filter((conn) => conn.targetHandle === "to").length === 0}
            />

            <LabeledHandle
                label="amount"
                type="target"
                position={Position.Left}
                id="amt"
                style={{ top: "70%" }}
                isConnectable={inputConnections.filter((conn) => conn.targetHandle === "amt").length === 0}
            />

            <LabeledHandle
                label="delay"
                type="target"
                position={Position.Left}
                id="delay"
                style={{ top: "80%" }}
                isConnectable={inputConnections.filter((conn) => conn.targetHandle === "delay").length === 0}
            />

            <button onClick={sendMessage}>Send</button>
        </W3CNode>
    );
};

export default MakeActorMessage;
