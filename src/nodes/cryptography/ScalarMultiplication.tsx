import React, { useEffect } from 'react';
import {
    NodeProps,
    Position,
    useNodeConnections,
    useNodesData,
    useReactFlow,
} from '@xyflow/react';
import { ProjectivePoint } from '@noble/secp256k1';
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import LabeledHandle from '../../LabeledHandle';
import W3CNode from '../../W3CNode';

interface ScalarMultiplicationNodeProps extends NodeProps {
    id: string;
    data: {
        in?: string;
        out?: string;
        label?: string;
    };
}

const DEFAULT_LABEL = "Scalar Multiplication";

const BASE = ProjectivePoint.BASE;

const ScalarMultiplication: React.FC<ScalarMultiplicationNodeProps> = ({ id, data }) => {
    const { updateNodeData } = useReactFlow();
    const inputConnections = useNodeConnections({
        handleType: 'target',
    });
    const nodeData = useNodesData(inputConnections[0]?.source);
    let computedPoint: ProjectivePoint | undefined = undefined;
    let computedPointHex = "";
    if (nodeData) {
        let nodeDataValue = Utf8DataTransfer.tryDecodeString(nodeData, inputConnections[0]?.sourceHandle);
        const n = BigInt(nodeDataValue);
        computedPoint = BASE.multiply(n);
        computedPointHex = computedPoint.toHex(false);
    }
    useEffect(() => {
        const newOut = Utf8DataTransfer.encodeString(computedPointHex);
        updateNodeData(id, { out: newOut });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [computedPointHex]);

    // If data.label is empty (or null), use the default.
    const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

    return (
        <W3CNode id={id} label={headerLabel} isGood={computedPoint !== undefined}>
            <div>X:{computedPoint?.x.toString(16).substring(0, 25) + "..." || "..."}</div>
            <div>Y:{computedPoint?.y.toString(16).substring(0, 25) + "..." || "..."}</div>
            {/* Single target handle that can accept multiple connections */}
            <LabeledHandle label="in" type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0} />
            {/* Source handle to expose the computed hash */}
            <LabeledHandle label="out" type="source" position={Position.Right} id="output" isConnectable={true} />
        </W3CNode>
    );
};

export default ScalarMultiplication;
