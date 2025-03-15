import React, { useEffect, useState } from 'react';
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

interface CompareNodeProps extends NodeProps {
    id: string;
    data: {
        in?: string;
        out?: string;
        label?: string;
    };
}

const DEFAULT_LABEL = "Equals";

const operatorFunctionMap = {
    "eq": (a: string, b: string) => a === b,
    "neq": (a: string, b: string) => a !== b,
    "gt": (a: string, b: string) => a > b,
    "lt": (a: string, b: string) => a < b,
    "gte": (a: string, b: string) => a >= b,
    "lte": (a: string, b: string) => a <= b,
};

const Compare: React.FC<CompareNodeProps> = ({ id, data }) => {
    const { updateNodeData } = useReactFlow();
    const inputConnections = useNodeConnections({ handleType: "target" });
    const [operator, setOperator] = useState<keyof typeof operatorFunctionMap>("eq");

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
    res = operatorFunctionMap[operator](left, right);
    useEffect(() => {
        const newOut = Utf8DataTransfer.encodeNumber(res ? 1 : 0);
        updateNodeData(id, { out: newOut });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [res]);

    // If data.label is empty (or null), use the default.
    const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

    return (
        <W3CNode id={id} label={headerLabel + "[" + operator + "]"} isGood={res}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "4px" }}>
                <div>
                    <label>
                        Operation:{" "}
                        <select
                            onChange={(e) => setOperator(e.target.value as keyof typeof operatorFunctionMap)}
                            className="nodrag"
                        >
                            {Object.keys(operatorFunctionMap).map((op) => (
                                <option key={op} value={op}>
                                    {op}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>
            <LabeledHandle label="left" type="target" style={{ top: "50%" }} position={Position.Left} id="left" isConnectable={inputConnections.filter((conn) => conn.targetHandle === "left").length === 0} />
            <LabeledHandle label="right" type="target" style={{ top: "80%" }} position={Position.Left} id="right" isConnectable={inputConnections.filter((conn) => conn.targetHandle === "right").length === 0} />
            <LabeledHandle label="is eq" type="source" position={Position.Right} id="output" />
        </W3CNode>
    );
};

export default Compare;
