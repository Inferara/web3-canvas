import React, { memo } from "react";
import {
  NodeProps,
  Handle,
  Position,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";

interface ColorViewNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;   // Not used, but present for consistency
    out?: string;  // Not used here, as this node doesn't produce output
  };
}

const ColorViewNode: React.FC<ColorViewNodeProps> = () => {
  const inputConnections = useNodeConnections({
    handleType: 'target',
  });

  const ids: string[] = [];
  if (inputConnections.length > 0) {
    inputConnections.forEach((connection) => {
      ids.push(connection.source);
    });
  }
  const nodesData = useNodesData(ids);
  let color = "#ccc";
  if (nodesData.length > 0) {
    let data: string = nodesData[0].data.out as string;
    for (let i = 1; i < nodesData.length; i++) {
      data += nodesData[i].data.out as string;
      const dataBytes = data.split('').map(char => char.charCodeAt(0));
      const nextDataBytes = (nodesData[i].data.out as string).split('').map(char => char.charCodeAt(0));
      for (let j = 0; j < dataBytes.length; j++) {
        dataBytes[j] ^= nextDataBytes[j % nextDataBytes.length];
      }
      data = String.fromCharCode(...dataBytes);
    }
    const dataBytes = data.split('').map(char => char.charCodeAt(0));
    const segmentLength = Math.ceil(dataBytes.length / 3);
    const segments = [
      dataBytes.slice(0, segmentLength),
      dataBytes.slice(segmentLength, segmentLength * 2),
      dataBytes.slice(segmentLength * 2, segmentLength * 3),
    ];
    color = segments
      .map((segment) => {
        const sum = segment.reduce((acc, byte) => acc + byte, 0);
        const normalized = Math.floor((sum / segment.length) % 256);
        return normalized.toString(16).padStart(2, "0");
      })
      .join("");
    color = `#${color}`;
  }

  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 150, backgroundColor: color }}>
      <div style={{ marginTop: 8 }}>
        {color}
      </div>
      {/* One handle for input, no output handle since it just displays data */}
      <Handle type="target" position={Position.Left} id="input" />
    </div>
  );
};

const MemoizedColorViewNode = memo(ColorViewNode);
export default MemoizedColorViewNode;
