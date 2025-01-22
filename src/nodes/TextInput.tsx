import React, { useCallback, useState } from 'react';
import { Handle, NodeProps, Position, useReactFlow } from '@xyflow/react';


interface TextInputNodeProps extends NodeProps {
    id: string;
    data: {
        in: string;
        out: string;
    }
}

const TextInputNode: React.FC<TextInputNodeProps> = ({ id, data}) => {
    const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        setText(evt.target.value);
        updateNodeData(id, { in: data.in, out: evt.target.value });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const { updateNodeData } = useReactFlow();
    const [text, setText] = useState(data.out);

    return (
        <>
            <div>
                <input id={`text-input-${id}`} name="text" value={text} onChange={onChange} className="nodrag" />
            </div>
            <Handle type="source" position={Position.Bottom} />
        </>
    );
};

export default TextInputNode;