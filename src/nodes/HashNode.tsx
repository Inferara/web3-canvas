import { Handle, NodeProps, Position, useHandleConnections, useNodesData, useReactFlow } from '@xyflow/react';
import { useEffect, useState } from 'react';
import web3 from 'web3';

interface HashNodeNodeProps extends NodeProps {
    id: string;
    data: {
        in: string;
        out: string;
    };
}

const HashNode: React.FC<HashNodeNodeProps> = ({ id }) => {
    const connections = useHandleConnections({ type: 'target' });
    const { updateNodeData } = useReactFlow();

    const source = connections?.[0]?.source;
    const nodeData = useNodesData(source ?? id);

    const [computedHash, setComputedHash] = useState("");

    useEffect(() => {
        if (source && nodeData) {
            const newText = web3.utils.keccak256Wrapper(nodeData.data.out as string);
            if (newText !== computedHash) {
                setComputedHash(newText); // Update local state only if the value changes
                updateNodeData(id, { out: newText }); // Update node data in React Flow
            }
        }
    }, [source, nodeData, id, computedHash, updateNodeData]);

    return (
        <>
            <div>
                <span>{computedHash}</span>
            </div>
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />
        </>
    );
};

export default HashNode;
