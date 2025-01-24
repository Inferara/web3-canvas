import React, { useCallback, useState } from 'react';
import { Handle, NodeProps, Position, useReactFlow } from '@xyflow/react';


interface TextInputNodeProps extends NodeProps {
    id: string;
    data: {
        in?: string;
        out?: number[];
    }
}

const TextInputNode: React.FC<TextInputNodeProps> = ({ id, data}) => {
    const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = evt.target.value;
        setText(newValue);
        const utf8Encoder = new TextEncoder();
        const newOut = utf8Encoder.encode(newValue);
        updateNodeData(id, { ...data, out: newOut });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const { updateNodeData } = useReactFlow();
    const [text, setText] = useState<string>(data.out ? new TextDecoder().decode(new Uint8Array(data.out)) : "");

    return (
        <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 150 }}>
          <div>Text Input Node</div>
          <input
            type="text"
            value={text}
            onChange={onChange}
            style={{ marginTop: 8 }}
            className="nodrag"
          />
          {/* This node doesn’t consume input, so only a source handle */}
          <Handle type="source" position={Position.Bottom} id="output" />
        </div>
      );
    };
    

export default TextInputNode;