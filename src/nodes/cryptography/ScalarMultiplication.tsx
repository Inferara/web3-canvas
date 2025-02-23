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
import { KeyPairNodeProps } from './KeyPair';
import LabeledHandle from '../../LabeledHandle';
import W3CNode from '../../W3CNode';

interface ScalarMultiplicationNodeProps extends NodeProps {
    id: string;
    data: {
        in?: string;
        out?: string;
    };
}

const BASE = ProjectivePoint.BASE;

const ScalarMultiplication: React.FC<ScalarMultiplicationNodeProps> = ({ id }) => {
    const { updateNodeData } = useReactFlow();
    const inputConnections = useNodeConnections({
        handleType: 'target',
    });
    const nodeData = useNodesData(inputConnections[0]?.source);
    let computedPoint: ProjectivePoint | undefined = undefined;
    let computedPointHex = "";
    if (nodeData) {
        let nodeDataValue = "";
        if (nodeData?.type === "keypair") {
            nodeDataValue = Utf8DataTransfer.readStringFromKeyPairNode(nodeData as KeyPairNodeProps, inputConnections[0]?.sourceHandle as string);
        } else {
            nodeDataValue = nodeData ? Utf8DataTransfer.decodeString(nodeData?.data.out as string) : "";
        }
        const n = BigInt(nodeDataValue);
        computedPoint = BASE.multiply(n);
        computedPointHex = computedPoint.toHex(false);
    }
    useEffect(() => {
        const newOut = Utf8DataTransfer.encodeString(computedPointHex);
        updateNodeData(id, { out: newOut });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [computedPointHex]);

    return (
        <W3CNode id={id} label="Scalar Multiplication" isGood={computedPoint !== undefined}>
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
