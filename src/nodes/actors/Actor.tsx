import React, { useEffect, useState } from "react";
import { NodeProps, useNodeConnections, useNodesData, useReactFlow } from "@xyflow/react";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";


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
