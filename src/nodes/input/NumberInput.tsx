import React, {  useState,  useCallback } from "react";
import {
  NodeProps,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import W3CNode from "../../W3CNode";
import LabeledHandle from "../../LabeledHandle";

interface NumberInputNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;   // Not used here, but present for consistency
    out?: string;  // We'll store the numeric value as a string in out
  };
}

const NumberInputNode: React.FC<NumberInputNodeProps> = ({ id, data }) => {
    const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(evt.target.value);
        setNumber(newValue);
        const newData = Utf8DataTransfer.encodeNumber(newValue);
        updateNodeData(id, { ...data, out: newData });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const { updateNodeData } = useReactFlow();
    const [numberValue, setNumber] = useState<number>(data.out ? Utf8DataTransfer.decodeNumber(data.out?.[0]) : 5);


  return (
    <W3CNode id={id} label="Number Input" isGood={true}>
      <div>Number Input Node</div>
      <input
        type="number"
        value={numberValue}
        onChange={onChange}
        style={{ marginTop: 8 }}
        className="nodrag"
      />
      {/* Source handle so other nodes can consume this numeric output */}
      <LabeledHandle label="out" type="source" position={Position.Bottom} id="output" />
    </W3CNode>
  );
};

export default NumberInputNode;
