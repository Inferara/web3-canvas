import React, { useEffect, useState } from "react";
import { NodeProps, Position, useNodeConnections, useNodesData, useReactFlow } from "@xyflow/react";
import W3CNode from "../../W3CNode";
import LabeledHandle from "../../LabeledHandle";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";

// A simple function to simulate generating an address from an input string.
function generateAddress(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = ((hash << 5) - hash) + input.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    const hex = (hash >>> 0).toString(16).padStart(8, "0");
    return "0x" + hex;
}

interface GroupNodeProps extends NodeProps {
    id: string;
    data: {
        in?: string;
        out?: string;
    };
}

const Group: React.FC<GroupNodeProps> = ({ id, data }) => {
    const { updateNodeData } = useReactFlow();

    return (
        <div id={id} itemType="group" style={{width: 500, height: 300}}>

        </div>
    );
};

export default Group;
