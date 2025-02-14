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

interface ActorNodeProps extends NodeProps {
    id: string;
    data: {
        in?: string;
        out?: string; // Here we'll store the balance as a string
        // Optionally, you might store messages, etc.
    };
}

const ActorNode: React.FC<ActorNodeProps> = ({ id, data }) => {
    const { updateNodeData } = useReactFlow();

    const [actorName, setActorName] = useState<string>("actor");
    const [editable, setEditable] = useState<boolean>(true);
    const [balance, setBalance] = useState<number>(100);
    const address = generateAddress(actorName);

    const inputConnections = useNodeConnections({ handleType: 'target' });
    const nodeData = useNodesData(inputConnections[0]?.source);
    if (nodeData) {
        const inputNumber = Utf8DataTransfer.unpack(nodeData.data.out as string) as number;
        if (!isNaN(inputNumber)) {
            setBalance(balance + inputNumber);
        }
    }

    useEffect(() => {
        if (data.out !== balance.toString()) {
            updateNodeData(id, { ...data, out: Utf8DataTransfer.encodeNumber(balance) });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [balance]);

    return (
        <div id={id}>
            <div>actorName</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "4px" }}>
                {editable && (
                    <div>
                        <input
                            type="text"
                            value={actorName}
                            onChange={(e) => setActorName(e.target.value)}
                            readOnly={!editable}
                            style={{ marginRight: "100px", width: 50 }}
                        />
                        <button onClick={() => setEditable((prev) => !prev)}>
                            {editable ? "Lock" : "Edit"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActorNode;
