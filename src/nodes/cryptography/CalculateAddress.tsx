import React, { useEffect } from 'react';
import {
  NodeProps,
  Position,
  useNodeConnections,
  useNodesData,
  useReactFlow,
} from '@xyflow/react';
import { keccak256 } from 'ethers';
import { Utf8DataTransfer } from "../../utils/Utf8DataTransfer";
import LabeledHandle from '../../common/LabeledHandle';
import W3CNode from '../../common/W3CNode';
import { useToast, ToastTypes, ToastType } from "../../common/ToastProvider";
import { normalizeEthereumAddress } from '../../utils/Utils';

// IN ORDER A NODE WORKS SMOOTHLY AND FAILUE FREE, IT MUST FOLLOW THE FOLLOWING PATTERN:

// Define the interface for the node props extending NodeProps.
interface CalculateAddressNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string;
    label?: string;
  };
}

// Define the node default label.
const DEFAULT_LABEL = "Calculate Address";

const CalculateAddress: React.FC<CalculateAddressNodeProps> = ({ id, data }) => {
  // If you need to update the canvas state, useReactFlow() hooks.
  const { updateNodeData } = useReactFlow();
  // Use toast to show messages to the user.
  const { addToast } = useToast();
  // Retrieve input connections.
  const inputConnections = useNodeConnections({ handleType: "target" });
  // Fuind a connection you need like this:
  const pubKeyConnection = inputConnections.find((conn) => conn.targetHandle === "pubKey");
  const pubKeyNodeData = useNodesData(pubKeyConnection?.source as string);
  // Define your variables and states with default values before actual computation.
  let computedAddress = "";
  // Create a variable to track an error message.
  let error = "";
  // Anything than can fail should be located inside a try-catch block.
  try {
    let pubKeyInput = Utf8DataTransfer.tryDecodeString(pubKeyNodeData, pubKeyConnection?.sourceHandle);
    if (pubKeyInput) computedAddress = normalizeEthereumAddress(keccak256("0x" + pubKeyInput.substring(4)).substring(26));
  } catch (e) {
    if (e instanceof Error) {
      error = e.message;
    }
  }
  // Use useEffect to update the node data or show a toast message.
  useEffect(() => {
    if (error) {
      addToast(error, ToastTypes.ERROR as ToastType);
    } else {
      const newOut = Utf8DataTransfer.encodeString(computedAddress); // Encode the data you share across nodes on the canvas.
      updateNodeData(id, { out: newOut });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedAddress]);
  
  // If data.label is empty (or null), use the default.
  const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;
  
  return (
    <W3CNode id={id} label={headerLabel} isGood={computedAddress.length === 42}>
      <div>{computedAddress.substring(0, 25) + "..." || "..."}</div>
      <div>{computedAddress ? ("Address length: " + computedAddress.length) : ""}</div>
      {/* Be specific when deciding if a target handle is connectable. */}
      <LabeledHandle label="in" type="target" position={Position.Left} id="pubKey" isConnectable={inputConnections.filter((conn) => conn.targetHandle === "pubKey").length === 0} />
      <LabeledHandle label="out" type="source" position={Position.Right} id="output" isConnectable={true} />
    </W3CNode>
  );
};

export default CalculateAddress;
