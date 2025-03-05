import React, { useEffect } from "react";
import { NodeProps, Position, useReactFlow } from "@xyflow/react";
import W3CNode from "../../W3CNode";
import LabeledHandle from "../../LabeledHandle";

interface IntervalClickNodeProps extends NodeProps {
  id: string;
  data: {
    interval: number; // interval in milliseconds
    out?: string;     // will output a click signal as JSON string
    label?: string;
  };
}

const DEFAULT_LABEL = "Interval Click";

const Interval: React.FC<IntervalClickNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const interval = data.interval || 1000; // default to 1 second if not set

  useEffect(() => {
    const timer = setInterval(() => {
      updateNodeData(id, { ...data, out: 0x10321 });
    }, interval);

    return () => clearInterval(timer);
  }, [interval, id, updateNodeData, data]);

  return (
    <W3CNode id={id} label={data.label || DEFAULT_LABEL} isGood={true}>
      <div>Interval: {interval}ms</div>
      <LabeledHandle
        label="out"
        type="source"
        position={Position.Right}
        id="output"
      />
    </W3CNode>
  );
};

export default Interval;
