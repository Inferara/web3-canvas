import React, { useCallback, useState } from 'react';
import { Handle, NodeProps, Position, useReactFlow } from '@xyflow/react';

import { Utf8DataTransfer } from "../../Utf8DataTransfer";

interface TextInputNodeProps extends NodeProps {
    id: string;
    data: {
        in?: string;
        out?: string;
    }
}

const TextInputNode: React.FC<TextInputNodeProps> = ({ id, data}) => {
    const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = evt.target.value;
        setText(newValue);
        const newOut = Utf8DataTransfer.encodeString(newValue);
        updateNodeData(id, { ...data, out: newOut });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const { updateNodeData } = useReactFlow();
    const [text, setText] = useState<string>(data.out ? Utf8DataTransfer.decodeString(data.out) : "");
    
    return (
        <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 150 }}>
          <input
            type="text"
            value={text}
            onChange={onChange}
            // style={{ marginTop: 8 }}
            className="nodrag"
          />
          {/* This node doesn’t consume input, so only a source handle */}
          <Handle type="source" position={Position.Bottom} id="output" />
        </div>
      );
    };
    

const MemoizedTextInputNode = React.memo(TextInputNode);
export default MemoizedTextInputNode;