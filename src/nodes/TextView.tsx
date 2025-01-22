import { Handle, NodeProps, Position, useHandleConnections, useNodesData } from '@xyflow/react';

interface TextViewNodeProps extends NodeProps {
    id: string
    data: {
        in: string;
        out: string;
    }
}

const TextViewNode: React.FC<TextViewNodeProps> = ({ id }) => {
    const connections = useHandleConnections({ type: 'target' });
    const source = connections?.[0]?.source;
    const nodeData = useNodesData(source ?? id);
    let text = "";
    if (source && nodeData) {
        text = (nodeData.data as { out: string }).out;
    }
    

    return (
        <>
            <div>
                <span>{text}</span>
            </div>
            <Handle type="target" position={Position.Left} />
        </>
    );
};

export default TextViewNode;