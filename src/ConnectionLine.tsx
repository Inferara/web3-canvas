import React from 'react';
import { useConnection } from '@xyflow/react';

interface ConnectionLineProps {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({ fromX, fromY, toX, toY }) => {
    const { fromHandle } = useConnection();

    return (
        <g>
            <path
                fill="none"
                stroke="grey"
                strokeWidth={1.5}
                className="animated"
                d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
            />
            <circle
                cx={toX}
                cy={toY}
                fill="#fff"
                r={3}
                stroke={fromHandle?.id ?? ''}
                strokeWidth={1.5}
            />
        </g>
    );
};

export default ConnectionLine;