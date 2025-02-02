import React, {  useState,  useCallback } from "react";
import {
  NodeProps,
  Handle,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";

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
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 150 }}>
      <div>Number Input Node</div>
      <input
        type="number"
        value={numberValue}
        onChange={onChange}
        style={{ marginTop: 8 }}
        className="nodrag"
      />
      {/* Source handle so other nodes can consume this numeric output */}
      <Handle type="source" position={Position.Bottom} id="output" />
    </div>
  );
};

export default NumberInputNode;
