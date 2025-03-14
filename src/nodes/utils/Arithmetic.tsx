import React, { useEffect, useState } from "react";
import { NodeProps, Position, useNodeConnections, useNodesData, useReactFlow } from "@xyflow/react";
import W3CNode from "../../W3CNode";
import LabeledHandle from "../../LabeledHandle";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";

interface ArithmeticNodeProps extends NodeProps {
    id: string;
    data: {
        in?: string;   // Expected numeric value as a string
        out?: string;  // The resulting value as a string
        label?: string;
    };
}

const DEFAULT_LABEL = "Arithmetic";

const operatorFunctionMap = {
    "sum": (a: number, b: number) => a + b,
    "sub": (a: number, b: number) => a - b,
    "mul": (a: number, b: number) => a * b,
    "div": (a: number, b: number) => a / b,
    "mod": (a: number, b: number) => a % b,
};

const ArithmeticNode: React.FC<ArithmeticNodeProps> = ({ id, data }) => {
    const { updateNodeData } = useReactFlow();
    const [operator, setOperator] = useState<keyof typeof operatorFunctionMap>("sum");
    
    const inputConnections = useNodeConnections({ handleType: "target" });
    
    const leftConnection = inputConnections.find((conn) => conn.targetHandle === "left");
    const rightConnection = inputConnections.find((conn) => conn.targetHandle === "right");

    const leftNodeData = useNodesData(leftConnection?.source as string);
    const rightNodeData = useNodesData(rightConnection?.source as string);

    const left = leftNodeData ? Utf8DataTransfer.tryDecodeString(leftNodeData, leftConnection?.sourceHandle) : "";
    const right = rightNodeData ? Utf8DataTransfer.tryDecodeString(rightNodeData, rightConnection?.sourceHandle) : "";

    useEffect(() => {
        if (!isNaN(parseFloat(left)) && !isNaN(parseFloat(right))) {
            const newValue = operatorFunctionMap[operator](parseFloat(left), parseFloat(right));
            const newOut = Utf8DataTransfer.encodeNumber(newValue);
            updateNodeData(id, { ...data, out: newOut });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [left, right, operator]);

    // If data.label is empty (or null), use the default.
    const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

    return (
        <W3CNode id={id} label={headerLabel} isGood={inputConnections.length > 0}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "4px" }}>
                <div>
                    <label>
                        Operation:{" "}
                        <select
                            onChange={(e) => setOperator(e.target.value as keyof typeof operatorFunctionMap)}
                            className="nodrag"
                        >
                            <option value="add">Sum</option>
                            <option value="sub">Sub</option>
                            <option value="mul">Mul</option>
                            <option value="div">Div</option>
                            <option value="mod">Mod</option>
                        </select>
                    </label>
                </div>
            </div>
            {/* Input handle */}
            <LabeledHandle label="left" type="target" style={{ top: "50%" }} position={Position.Left} id="left" isConnectable={inputConnections.filter((conn) => conn.targetHandle === "left").length === 0} />
            <LabeledHandle label="right" type="target" style={{ top: "75%" }} position={Position.Left} id="right" isConnectable={inputConnections.filter((conn) => conn.targetHandle === "right").length === 0} />
            {/* Output handle */}
            <LabeledHandle label="out" type="source" position={Position.Right} id="output" />
        </W3CNode>
    );
};

export default ArithmeticNode;
