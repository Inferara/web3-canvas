import React, { useCallback, useState } from 'react';
import { Handle, NodeProps, Position, useReactFlow } from '@xyflow/react';

import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import W3CNode from '../../W3CNode';

interface TextInputNodeProps extends NodeProps {
    id: string;
    data: {
        in?: string;
        out?: string;
    }
}

const TextInputNode: React.FC<TextInputNodeProps> = ({ id, data}) => {
    const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = evt.target.value;
        setText(newValue);
        const newOut = Utf8DataTransfer.encodeString(newValue);
        updateNodeData(id, { ...data, out: newOut });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const { updateNodeData } = useReactFlow();
    const [text, setText] = useState<string>(data.out ? Utf8DataTransfer.decodeString(data.out) : "");
    
    return (
        <W3CNode id={id} label="Text Input" isGood={text.length > 0} isRezieable={true}>
          <textarea
            value={text}
            onChange={onChange}
            className="nodrag"
          />
          <Handle type="source" position={Position.Right} id="output" />
        </W3CNode>
      );
    };
    

export default TextInputNode;
