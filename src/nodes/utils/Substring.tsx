import React, { useEffect, useState, useCallback } from "react";
import {
  NodeProps,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";

import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import W3CNode from "../../W3CNode";
import LabeledHandle from "../../LabeledHandle";

interface SubstringNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string; // substring output
    label?: string;
  };
}

const DEFAULT_LABEL = "Substring";

const SubstringNode: React.FC<SubstringNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const [startPos, setStartPos] = useState<number>(0);
  const [endPos, setEndPos] = useState<number>(0);

  const inputConnections = useNodeConnections({ handleType: 'target' });
  const nodeData = useNodesData(inputConnections[0]?.source);
  let inputStr = "";
  if (nodeData) {
    inputStr = Utf8DataTransfer.tryDecodeString(nodeData, inputConnections[0]?.sourceHandle);
  }

  const onStartPosChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(evt.target.value, 10);
    setStartPos(newValue);
    const newOut = Utf8DataTransfer.encodeString(evt.target.value);
    updateNodeData(id, { ...data, out: newOut });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEndPosChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(evt.target.value, 10);
    setEndPos(newValue);
    const newOut = Utf8DataTransfer.encodeString(evt.target.value);
    updateNodeData(id, { ...data, out: newOut });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const res = inputStr.substring(startPos, endPos);
    const newOut = Utf8DataTransfer.encodeString(res);
    updateNodeData(id, { out: newOut });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputStr, startPos, endPos]);

  // If data.label is empty (or null), use the default.
  const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

  return (
    <W3CNode id={id} label={headerLabel} isGood={inputConnections.length > 0}>
      <div style={{ width: 100, display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
        <label>Start: </label>
        <input
          type="number"
          min={0}
          value={startPos}
          onChange={onStartPosChange}
          className="nodrag"
          id="start"
          style={{ width: "70%" }}
        />
      </div>
      <div style={{ width: 100, display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
        <label>End: </label>
        <input
          type="number"
          value={endPos}
          max={inputStr ? inputStr.length : 0}
          onChange={onEndPosChange}
          className="nodrag"
          id="end"
          style={{ width: "70%" }}
        />
      </div>

      <LabeledHandle label="str" type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0} />
      <LabeledHandle label="substr" type="source" position={Position.Right} id="output" />
    </W3CNode>
  );
};

export default SubstringNode;
