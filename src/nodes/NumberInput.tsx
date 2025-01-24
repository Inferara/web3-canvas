import React, { useEffect, useState, ChangeEvent } from "react";
import {
  NodeProps,
  Handle,
  Position,
  useReactFlow,
} from "@xyflow/react";

interface NumberInputNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;   // Not used here, but present for consistency
    out?: number[];  // We'll store the numeric value as a string in out
  };
}

const NumberInputNode: React.FC<NumberInputNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();

  // Local state for the numeric input; default to data.out or "0"
  const [numberValue, setNumberValue] = useState<number>(data.out?.[0] ?? 0);

  // Sync local state if data.out changes externally (load, undo/redo, etc.)
  useEffect(() => {
    if (data.out !== undefined && data.out[0] !== numberValue) {
      setNumberValue(data.out[0] ?? 0);
    }
  }, [data.out, numberValue]);

  // Update local state + node data in one step
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = parseFloat(e.target.value);
    setNumberValue(newVal);
    // Update node data if there's an actual change
    if (newVal !== data.out?.[0]) {
      updateNodeData(id, { ...data, out: newVal });
    }
  };

  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 150 }}>
      <div>Number Input Node</div>
      <input
        type="number"
        value={numberValue}
        onChange={handleChange}
        style={{ marginTop: 8 }}
        className="nodrag"
      />
      {/* Source handle so other nodes can consume this numeric output */}
      <Handle type="source" position={Position.Bottom} id="output" />
    </div>
  );
};

export default NumberInputNode;
