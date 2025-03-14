import React, { useState } from "react";
import { NodeProps } from "@xyflow/react";
import W3CNode from "../../W3CNode";
import { NetworkManager, Transaction } from "../../NetworkManager";

interface NetworkNodeProps extends NodeProps {
    id: string;
    data: {
        in?: string;
        out?: string; // Encoded delayed message
        label?: string;
        delay?: number; // Delay in milliseconds
    };
}

const DEFAULT_LABEL = "Network Log";

const NetworkNode: React.FC<NetworkNodeProps> = ({ id, data }) => {
    const networkManager = NetworkManager.getInstance();
    const [log, setLog ] = useState<string[]>([]);
    networkManager.subscribe(id, (tx: Transaction) => {
        setLog((prevLog) => [...prevLog, `${tx.from} sent ${tx.amount} to ${tx.to}`]);
    });

    return (
        <W3CNode id={id} isResizeable={true} label={data.label || DEFAULT_LABEL} isGood={log.length > 0} minWidth={370} minHeight={200}>
            <div style={{ overflowY: "auto", width: "100%", textAlign: "left" }} >{log.map((entry, index) => <div style={{marginLeft: 10}} key={index}>{entry}</div>)}</div>
        </W3CNode>
    );
};

export default NetworkNode;
