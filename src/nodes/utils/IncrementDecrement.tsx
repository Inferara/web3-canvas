import React, { useEffect, useState } from "react";
import { NodeProps, Position, useNodeConnections, useNodesData, useReactFlow } from "@xyflow/react";
import W3CNode from "../../W3CNode";
import LabeledHandle from "../../LabeledHandle";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";

interface IncrementDecrementNodeProps extends NodeProps {
    id: string;
    data: {
        in?: string;   // Expected numeric value as a string
        out?: string;  // The resulting value as a string
    };
}

const IncrementDecrementNode: React.FC<IncrementDecrementNodeProps> = ({ id, data }) => {
    const { updateNodeData } = useReactFlow();
    const [step, setStep] = useState<number>(0);
    const [inc, setInc] = useState<boolean>(false);

    const inputConnections = useNodeConnections({ handleType: 'target' });
    const nodeData = useNodesData(inputConnections[0]?.source);
    let inputNumber = 0;
    if (nodeData) {
        inputNumber = Utf8DataTransfer.unpack(nodeData.data.out as string) as number;
    }

    useEffect(() => {
        if (!isNaN(inputNumber)) {
            const newValue = inc ? inputNumber + step : inputNumber - step;
            const newOut = Utf8DataTransfer.encodeNumber(newValue);
            updateNodeData(id, { ...data, out: newOut });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputNumber, step, inc]);

    return (
        <W3CNode id={id} label="In[de]crement" isGood={inputConnections.length > 0}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "4px" }}>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={inc}
                            onChange={(e) => setInc(e.target.checked)}
                            style={{ marginRight: "4px" }}
                        />
                        {inc ? "Increment" : "Decrement"}
                    </label>
                </div>
                <div>
                    <label>
                        Step:{" "}
                        <input
                            type="number"
                            value={step}
                            onChange={(e) => setStep(parseFloat(e.target.value) || 0)}
                            style={{ width: "60px" }}
                            className="nodrag"
                        />
                    </label>
                </div>
            </div>
            {/* Input handle */}
            <LabeledHandle label="in" type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0} />
            {/* Output handle */}
            <LabeledHandle label="out" type="source" position={Position.Right} id="output" />
        </W3CNode>
    );
};

export default IncrementDecrementNode;
