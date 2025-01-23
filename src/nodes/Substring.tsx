import React, { useEffect, useState, ChangeEvent } from "react";
import {
  NodeProps,
  Handle,
  Position,
  useNodes,
  useEdges,
  useReactFlow,
} from "@xyflow/react";

interface SubstringNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string; // substring output
  };
}

const SubstringNode: React.FC<SubstringNodeProps> = ({ id, data }) => {
  const nodes = useNodes();
  const edges = useEdges();
  const { updateNodeData } = useReactFlow();

  // Local numeric state for the substring length (defaults to 5).
  // No immediate writing into `data` to avoid infinite re-renders.
  const [lengthValue, setLengthValue] = useState<number>(5);

  // Local state to store this node’s current output (the substring).
  const [substringOutput, setSubstringOutput] = useState<string>(data.out ?? "");

  useEffect(() => {
    // 1) Identify any edges whose target is this node at handle "input"
    const incomingEdges = edges.filter(
      (edge) => edge.target === id && edge.targetHandle === "input"
    );

    // 2) Gather and concatenate the 'out' of each source node
    const combinedInput = incomingEdges
      .map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        return sourceNode?.data?.out || "";
      })
      .join("");

    // 3) Slice the combined input to lengthValue
    const newSubstring = combinedInput.slice(0, lengthValue);

    // 4) Update local state and React Flow node data *only* if changed
    if (newSubstring !== substringOutput) {
      setSubstringOutput(newSubstring);
      updateNodeData(id, { ...data, out: newSubstring });
    }
  }, [id, data, edges, nodes, lengthValue, substringOutput, updateNodeData]);

  // Handle numeric input changes locally
  const handleLengthChange = (e: ChangeEvent<HTMLInputElement>) => {
    // parseInt safely, default to 0
    const newLen = parseInt(e.target.value, 10) || 0;
    setLengthValue(newLen);
  };

  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 150 }}>
      <div>Substring Node</div>

      <div style={{ marginTop: 8 }}>
        <label>
          Length:
          <input
            type="number"
            min={0}
            value={lengthValue}
            onChange={handleLengthChange}
            style={{ width: 60, marginLeft: 8 }}
            className="nodrag"
          />
        </label>
      </div>

      <div style={{ marginTop: 8 }}>
        Output: <strong>{substringOutput}</strong>
      </div>

      {/* One input handle (target), one output handle (source) */}
      <Handle type="target" position={Position.Left} id="input" />
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
};

export default SubstringNode;
