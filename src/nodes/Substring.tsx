import React, { useEffect, useState, useCallback } from "react";
import {
  NodeProps,
  Handle,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";

import { Utf8DataTransfer } from "../Utf8DataTransfer";
import { KeyPairNodeProps } from "./web3/KeyPair";

interface SubstringNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string; // substring output
  };
}

const SubstringNode: React.FC<SubstringNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const [startPos, setStartPos] = useState<number>(0);
  const [endPos, setEndPos] = useState<number>(0);
  
  const inputConnections = useNodeConnections({ handleType: 'target' });
  const nodeData = useNodesData(inputConnections[0]?.source);
  let inputStr = "";
  if (nodeData) {
    if (nodeData?.type === "keypair") {
      const sourceHandle = inputConnections[0]?.sourceHandle;
      if (sourceHandle === "publicKey") {
        inputStr = nodeData ? Utf8DataTransfer.decodeString((nodeData as KeyPairNodeProps).data.out?.publicKey as string) : "";
      } else if (sourceHandle === "privateKey") {
        inputStr = nodeData ? Utf8DataTransfer.decodeString((nodeData as KeyPairNodeProps).data.out?.privateKey as string) : "";
      } else if (sourceHandle === "address") {
        inputStr = nodeData ? Utf8DataTransfer.decodeString((nodeData as KeyPairNodeProps).data.out?.address as string) : "";
      }
    } else {
      inputStr = nodeData ? Utf8DataTransfer.decodeString(nodeData?.data.out as string) : "";
    }
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


  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 150 }}>
      <div>Substring Node</div>

      <input
        type="number"
        min={0}
        value={startPos}
        onChange={onStartPosChange}
        style={{ marginTop: 8 }}
        className="nodrag"
        id="start"
      />

      <input
        type="number"
        value={endPos}
        max={inputStr ? inputStr.length : 0}
        onChange={onEndPosChange}
        style={{ marginTop: 8 }}
        className="nodrag"
        id="end"
      />

      {/* One input handle (target), one output handle (source) */}
      <Handle type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0} />
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
};

export default SubstringNode;
