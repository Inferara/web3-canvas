import React, {  useState,  useCallback } from "react";
import {
  NodeProps,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { Utf8DataTransfer } from "../../utils/Utf8DataTransfer";
import W3CNode from "../../common/W3CNode";
import LabeledHandle from "../../common/LabeledHandle";

interface NumberInputNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;   // Not used here, but present for consistency
    out?: string;  // We'll store the numeric value as a string in out
    label?: string;
  };
}

const DEFAULT_LABEL = "Number Input";

const NumberInputNode: React.FC<NumberInputNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const [numberValue, setNumber] = useState<number>(data.out ? Utf8DataTransfer.decodeNumber(data.out?.[0]) : 5);
  const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(evt.target.value);
      setNumber(newValue);
      const newData = Utf8DataTransfer.encodeNumber(newValue);
      updateNodeData(id, { ...data, out: newData });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If data.label is empty (or null), use the default.
  const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

  return (
    <W3CNode id={id} label={headerLabel} isGood={true}>
      <input
        type="number"
        value={numberValue}
        onChange={onChange}
        className="nodrag"
        style={{ width: 100 }}
      />
      {/* Source handle so other nodes can consume this numeric output */}
      <LabeledHandle label="out" type="source" position={Position.Right} id="output" />
    </W3CNode>
  );
};

export default NumberInputNode;
