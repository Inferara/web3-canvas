import React from "react";
import { NodeProps, Position, useNodeConnections, useNodesData } from "@xyflow/react";
import W3CNode from "../../W3CNode";
import LabeledHandle from "../../LabeledHandle";
import { W3CMessageQueue, W3CQueueMessageType } from "../../infrastructure/Queue";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import { W3CDatabase } from "../../infrastructure/Database";

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
  const duration = data.interval || 1000;
  const inputConnections = useNodeConnections({ handleType: 'target' });

  const combinedData: string[] = [];
  const ids = [];
  for (let i = 0; i < inputConnections.length; i++) {
    ids.push(inputConnections[i]?.source);
  }

  const nodesData = useNodesData(ids);

  for (let i = 0; i < nodesData.length; i++) {
    const nodeData = nodesData[i];
    let inputNodeId = Utf8DataTransfer.tryDecodeString(nodeData, inputConnections[i]?.sourceHandle);
    inputNodeId = inputNodeId.startsWith("w3cnode_") ? inputNodeId : nodeData.id;
    combinedData.push(inputNodeId);
  }

  const startInterval = () => {
    let interval = W3CDatabase.getInstance().getInterval(id);
    if (interval) {
      return;
    }
    const intervalId = setInterval(() => {
      W3CMessageQueue.getInstance().enqueue({
        from: id,
        to: combinedData,
        payload: true,
        type: W3CQueueMessageType.Node,
        timestamp: new Date().toDateString(),
        delay: 0,
      })
    }, duration);
    W3CDatabase.getInstance().addInterval(id, intervalId);
  };

  const stopInterval = () => {
    W3CDatabase.getInstance().removeInterval(id);
  };

  return (
    <W3CNode id={id} label={data.label || DEFAULT_LABEL} isGood={true}>
      <div>Interval: {duration}ms</div>
      <button onClick={startInterval}>Start</button>
      <button onClick={stopInterval}>Stop</button>
      <LabeledHandle label="signal" type="target" position={Position.Left} id="input" />
    </W3CNode>
  );
};

export default Interval;
