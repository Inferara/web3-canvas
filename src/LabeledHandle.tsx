import { Handle, HandleType, Position } from '@xyflow/react';
import React from 'react';

interface LabeledHandleProps {
    label: string;
    side: string;
    type: HandleType;
    position: Position;
    id: string;
    style?: React.CSSProperties;
    isConnectable?: boolean;
}

const LabeledHandle: React.FC<LabeledHandleProps> = ({ label, side, type, position, id, style = {}, isConnectable = true }) => {
    let className = `handleLabel-${side}`;
    if (side === "right") {
        className += "-" + (label.length > 3 ? "45" : "20");
    }
    return (
        <Handle
            type={type}
            position={position}
            id={id}
            style={style}
            isConnectable={isConnectable}
        >
            <div className={className}>{label}</div>
        </Handle>
    );
};

export default LabeledHandle;