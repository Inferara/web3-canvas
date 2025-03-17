import React, { useEffect } from "react";
import { NodeProps, Position, useNodeConnections, useNodesData, useReactFlow } from "@xyflow/react";
import W3CNode from "../../W3CNode";
import LabeledHandle from "../../LabeledHandle";
import { W3CMessageQueue, W3CQueueMessageType } from "../../infrastructure/Queue";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";

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
  const interval = data.interval || 1000;
  const inputConnections = useNodeConnections({ handleType: 'target' });

  let intervalId: string | number | NodeJS.Timeout | undefined;

  const combinedData: string[] = [];
  const ids = [];
    for (let i = 0; i < inputConnections.length; i++) {
      ids.push(inputConnections[i]?.source);
    }
  
    const nodesData = useNodesData(ids);
  
    for (let i = 0; i < nodesData.length; i++) {
      const nodeData = nodesData[i];
      combinedData.push(Utf8DataTransfer.tryDecodeString(nodeData, inputConnections[i]?.sourceHandle));
    }

  const startInterval = () => {

    intervalId = setInterval(() => {
        W3CMessageQueue.getInstance().enqueue({
          from: id,
          to: combinedData,
          payload: true,
          type: W3CQueueMessageType.Node,
          timestamp: new Date().toDateString(),
          delay: 0,
        });
    }
    , interval,);
  };

  const stopInterval = () => {
    clearInterval(intervalId);
  };

  return (
    <W3CNode id={id} label={data.label || DEFAULT_LABEL} isGood={true}>
      <div>Interval: {interval}ms</div>
      <button onClick={startInterval}>Start</button>
      <button onClick={stopInterval}>Stop</button>
      <LabeledHandle label="in" type="target" position={Position.Left} id="input" />
    </W3CNode>
  );
};

export default Interval;
