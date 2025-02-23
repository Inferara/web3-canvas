import React, {useCallback, useState} from 'react';
import {NodeProps, Position, useReactFlow} from '@xyflow/react';

import {Utf8DataTransfer} from "../../Utf8DataTransfer";
import W3CNode from '../../W3CNode';
import LabeledHandle from '../../LabeledHandle';

interface TextInputNodeProps extends NodeProps {
    id: string;
    data: {
        in?: string;
        out?: string;
        label?: string;
    }
}

const DEFAULT_LABEL = "Text Input";

const TextInputNode: React.FC<TextInputNodeProps> = ({id, data}) => {
    const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = evt.target.value;
        setText(newValue);
        const newOut = Utf8DataTransfer.encodeString(newValue);
        updateNodeData(id, {...data, out: newOut});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const {updateNodeData} = useReactFlow();
    const [text, setText] = useState<string>(data.out ? Utf8DataTransfer.decodeString(data.out) : "");

    // If data.label is empty (or null), use the default.
    const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

    // Track whether the textarea is focused
    const [isFocused, setIsFocused] = useState(false);

    return (
      <W3CNode id={id} label={headerLabel} isGood={text.length > 0} isRezieable={true}>
          <textarea
            value={text}
            onChange={onChange}
            className="nodrag"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            spellCheck={isFocused}
          />
          <LabeledHandle label="out" type="source" position={Position.Right} id="output"/>
      </W3CNode>
    );
};

export default TextInputNode;
