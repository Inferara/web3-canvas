import React, { useEffect } from 'react';
import {
    NodeProps,
    Position,
    useNodeConnections,
    useNodesData,
    useReactFlow,
} from '@xyflow/react';
import { Utf8DataTransfer } from '../../Utf8DataTransfer';
import W3CNode from '../../W3CNode';
import LabeledHandle from '../../LabeledHandle';

interface EqualstNodeProps extends NodeProps {
    id: string;
    data: {
        in?: string;
        out?: string;
        label?: string;
    };
}

const DEFAULT_LABEL = "Equals";

const Equals: React.FC<EqualstNodeProps> = ({ id, data }) => {
    const { updateNodeData } = useReactFlow();
    const inputConnections = useNodeConnections({ handleType: "target" });
    const leftConnection = inputConnections.find(
        (conn) => conn.targetHandle === "left"
    );
    const rightConnection = inputConnections.find(
        (conn) => conn.targetHandle === "right"
    );

    const leftNodeData = useNodesData(leftConnection?.source as string);
    const rightNodeData = useNodesData(rightConnection?.source as string);
    let res = false;

    // Decode the incoming ciphertext and private key.
    const left = leftNodeData
        ? Utf8DataTransfer.tryDecodeString(leftNodeData, leftConnection?.sourceHandle)
        : "1";
    const right = rightNodeData
        ? Utf8DataTransfer.tryDecodeString(rightNodeData, rightConnection?.sourceHandle)
        : "2";
    res = left === right;
    useEffect(() => {
        const newOut = Utf8DataTransfer.encodeNumber(res ? 1 : 0);
        updateNodeData(id, { out: newOut });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [res]);

    // If data.label is empty (or null), use the default.
    const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

    return (
        <W3CNode id={id} label={headerLabel} isGood={res}>
            <div>{res ? "👍" : "👎"}</div>
            <LabeledHandle label="left" type="target" style={{ top: "50%" }} position={Position.Left} id="left" isConnectable={inputConnections.filter((conn) => conn.targetHandle === "left").length === 0} />
            <LabeledHandle label="right" type="target" style={{ top: "80%" }} position={Position.Left} id="right" isConnectable={inputConnections.filter((conn) => conn.targetHandle === "right").length === 0} />
            <LabeledHandle label="is eq" type="source" position={Position.Right} id="output" />
        </W3CNode>
    );
};

export default Equals;
