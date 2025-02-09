import { NodeResizeControl } from '@xyflow/react';
import React from 'react';
import { ResizeIcon } from './ResizeIcon';

interface W3CNodeProps {
    label: string;
    isRezieable?: boolean;
    isGood?: boolean;
    children?: React.ReactNode;
}

const W3CNode: React.FC<W3CNodeProps> = ({ label, isRezieable = false, isGood = false, children }) => {

    const headerStyle = isGood ? "w3cflownodeheader good" : "w3cflownodeheader";
    return (
        <div style={{ width: "100%" }}>
            {isRezieable && (
                <NodeResizeControl minWidth={250} minHeight={100}>
                    <ResizeIcon />
                </NodeResizeControl>
            )}
            <div className={headerStyle}>{label}</div>
            <div className="w3cflownode">
                {children}
            </div>
        </div>
    );
};

export default W3CNode;