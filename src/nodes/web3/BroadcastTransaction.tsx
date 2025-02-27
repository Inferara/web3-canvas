import React, { useState } from "react";
import {
  NodeProps,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import { JsonRpcProvider } from 'ethers';
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import LabeledHandle from "../../LabeledHandle";
import W3CNode from "../../W3CNode";

interface BroadcastTransactionNodeProps extends NodeProps {
  id: string;
  data: {
    in?: object;
    out?: string;
    label?: string;
  };
}

const DEFAULT_LABEL = "Broadcast Transaction";

const BroadcastTransactionNode: React.FC<BroadcastTransactionNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const inputConnections = useNodeConnections({ handleType: "target" });

  // Retrieve inputs from the designated handles.
  const providerConnection = inputConnections.find((conn) => conn.targetHandle === "provider");
  const txConnection = inputConnections.find((conn) => conn.targetHandle === "tx");

  const providerNodeData = useNodesData(providerConnection?.source as string);
  const txNodeData = useNodesData(txConnection?.source as string);

  // Decode the provider URL and signed transaction.
  const providerUrl = providerNodeData
    ? Utf8DataTransfer.tryDecodeString(providerNodeData.data, providerConnection?.sourceHandle)
    : "https://linea.drpc.org";
  const signedTx = txNodeData
    ? Utf8DataTransfer.tryDecodeString(txNodeData.data.out, txConnection?.sourceHandle)
    : "";

  const [txHash, setTxHash] = useState<string>("");
  const [broadcasting, setBroadcasting] = useState<boolean>(false);

  const handleBroadcast = async () => {
    if (!signedTx) {
      console.warn("Signed transaction is missing.");
      return;
    }
    try {
      setBroadcasting(true);
      const provider = new JsonRpcProvider(providerUrl);
      const txResponse = await provider.broadcastTransaction(signedTx);
      setTxHash(txResponse.hash);
      updateNodeData(id, { out: Utf8DataTransfer.encodeString(txResponse.hash) });
      const receipt = await txResponse.wait();
      setTxHash("In block " + receipt?.blockNumber);
      updateNodeData(id, { out: Utf8DataTransfer.encodeString(receipt?.blockHash as string) });
    } catch (error) {
      console.error("Broadcasting failed:", error);
      setTxHash("Error");
      updateNodeData(id, { out: Utf8DataTransfer.encodeString("Error") });
      setBroadcasting(false);
    }
  };

  // If data.label is empty (or null), use the default.
  const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

  return (
    <W3CNode id={id} label={headerLabel} isGood={txHash.length > 0}>
      <div>{txHash.substring(0, 25) + "..." || "..."}</div>
      <button onClick={handleBroadcast} disabled={broadcasting || !providerUrl || !signedTx}>
        {broadcasting ? "Broadcasting..." : "Broadcast"}
      </button>

      <LabeledHandle
        label="provider"
        type="target"
        position={Position.Left}
        id="provider"
        style={{ top: "50%" }}
        isConnectable={inputConnections.filter((conn) => conn.targetHandle === "provider").length === 0}
      />
      <LabeledHandle
        label="transaction"
        type="target"
        position={Position.Left}
        id="tx"
        style={{ top: "75%" }}
        isConnectable={inputConnections.filter((conn) => conn.targetHandle === "tx").length === 0}
      />
      <LabeledHandle label="tx hash" type="source" position={Position.Right} id="output" />
    </W3CNode>
  );
};

export default BroadcastTransactionNode;
