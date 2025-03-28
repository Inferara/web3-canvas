import React from "react";
import {
  NodeProps,
  Position,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import W3CNode from "../../common/W3CNode";
import LabeledHandle from "../../common/LabeledHandle";

interface ColorViewNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;   // Not used, but present for consistency
    out?: string;  // Not used here, as this node doesn't produce output
    label?: string;
  };
}

const DEFAULT_LABEL = "Color";

const ColorViewNode: React.FC<ColorViewNodeProps> = ({id, data}) => {
  const inputConnections = useNodeConnections({
    handleType: 'target',
  });

  const nodesData = useNodesData(inputConnections[0]?.source);
  const rawColor = nodesData ? (nodesData.data.out as string) : "#ccc";
  const colorBytes = rawColor.split('').map(char => char.charCodeAt(0));
  while (colorBytes.length < 3) {
    colorBytes.push(0);
  }
  const segmentLength = Math.ceil(colorBytes.length / 3);
  const segments = [
    colorBytes.slice(0, segmentLength),
    colorBytes.slice(segmentLength, segmentLength * 2),
    colorBytes.slice(segmentLength * 2, segmentLength * 3),
  ];
  let hexColor = segments
    .map((segment) => {
      const sum = segment.reduce((acc, byte) => acc + byte, 0);
      const normalized = Math.floor((sum / segment.length) % 256);
      return normalized.toString(16).padStart(2, "0");
    })
    .join("");
  hexColor = `#${hexColor}`;

  // If data.label is empty (or null), use the default.
  const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

  return (
    <W3CNode id={id} label={headerLabel} isGood={true}>
      <div style={{ width: "80%", height: "40px", backgroundColor: hexColor }}/>
      <div>
        {hexColor}
      </div>
      <LabeledHandle label="in" type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0} />
    </W3CNode>
  );
};

const MemoizedColorViewNode = React.memo(ColorViewNode);
export default MemoizedColorViewNode;
