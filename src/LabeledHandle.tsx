import { Handle, HandleType, Position } from '@xyflow/react';
import React from 'react';

interface LabeledHandleProps {
    title: string;
    type: HandleType;
    position: Position;
    id: string;
    style: React.CSSProperties;
    isConnectable: boolean;
}

const LabeledHandle: React.FC<LabeledHandleProps> = ({ title, type, position, id, style, isConnectable }) => {

    return (
        <Handle
            type={type}
            position={position}
            id={id}
            style={style}
            isConnectable={isConnectable}
        ><div className="handleLabel">{title}</div></Handle>
    );
};

export default LabeledHandle;