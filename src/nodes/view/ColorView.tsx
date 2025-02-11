import React from "react";
import {
  NodeProps,
  Position,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import W3CNode from "../../W3CNode";
import LabeledHandle from "../../LabeledHandle";

interface ColorViewNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;   // Not used, but present for consistency
    out?: string;  // Not used here, as this node doesn't produce output
  };
}

const ColorViewNode: React.FC<ColorViewNodeProps> = ({id}) => {
  const inputConnections = useNodeConnections({
    handleType: 'target',
  });

  const nodesData = useNodesData(inputConnections[0]?.source);
  const data = nodesData ? nodesData?.data.out as string : "#ccc";
  const dataBytes = data.split('').map(char => char.charCodeAt(0));
  while (dataBytes.length < 3) {
    dataBytes.push(0);
  }
  const segmentLength = Math.ceil(dataBytes.length / 3);
  const segments = [
    dataBytes.slice(0, segmentLength),
    dataBytes.slice(segmentLength, segmentLength * 2),
    dataBytes.slice(segmentLength * 2, segmentLength * 3),
  ];
  let color = segments
    .map((segment) => {
      const sum = segment.reduce((acc, byte) => acc + byte, 0);
      const normalized = Math.floor((sum / segment.length) % 256);
      return normalized.toString(16).padStart(2, "0");
    })
    .join("");
  color = `#${color}`;

  return (
    <W3CNode id={id} label="Color" isGood={true}>
      <div style={{ width: "80%", height: "40px", backgroundColor: color }}/>
      <div>
        {color}
      </div>
      <LabeledHandle label="in" type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0} />
    </W3CNode>
  );
};

const MemoizedColorViewNode = React.memo(ColorViewNode);
export default MemoizedColorViewNode;
