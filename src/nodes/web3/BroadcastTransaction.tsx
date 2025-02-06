import React, { useState } from "react";
import {
  NodeProps,
  Handle,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import Web3 from "web3";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import LabeledHandle from "../../LabeledHandle";

interface BroadcastTransactionNodeProps extends NodeProps {
  id: string;
  data: {
    in?: object;
    out?: string;
  };
}

const BroadcastTransactionNode: React.FC<BroadcastTransactionNodeProps> = ({ id }) => {
  const { updateNodeData } = useReactFlow();
  const inputConnections = useNodeConnections({ handleType: "target" });

  // Retrieve inputs from the designated handles.
  const providerConnection = inputConnections.find((conn) => conn.targetHandle === "provider");
  const txConnection = inputConnections.find((conn) => conn.targetHandle === "tx");

  const providerNodeData = useNodesData(providerConnection?.source as string);
  const txNodeData = useNodesData(txConnection?.source as string);

  // Decode the provider URL and signed transaction.
  const providerUrl = providerNodeData
    ? Utf8DataTransfer.decodeString(providerNodeData.data.out as string)
    : "";
  const signedTx = txNodeData
    ? Utf8DataTransfer.decodeString(txNodeData.data.out as string)
    : "";

  const [txHash, setTxHash] = useState<string>("");
  const [broadcasting, setBroadcasting] = useState<boolean>(false);

  const handleBroadcast = async () => {
    if (!providerUrl || !signedTx) {
      console.warn("Provider URL or signed transaction is missing.");
      return;
    }
    try {
      setBroadcasting(true);
      const web3 = new Web3(providerUrl);
      // Broadcast the signed transaction.
      web3.eth
        .sendSignedTransaction(signedTx)
        .on("transactionHash", (hash) => {
          setTxHash(hash);
          updateNodeData(id, { out: Utf8DataTransfer.encodeString(hash) });
          setBroadcasting(false);
        })
        .on("error", (error) => {
          console.error("Error broadcasting transaction:", error);
          setTxHash("Error");
          updateNodeData(id, { out: Utf8DataTransfer.encodeString("Error") });
          setBroadcasting(false);
        });
    } catch (error) {
      console.error("Broadcasting failed:", error);
      setTxHash("Error");
      updateNodeData(id, { out: Utf8DataTransfer.encodeString("Error") });
      setBroadcasting(false);
    }
  };

  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 250 }}>
      <div>Broadcast Transaction Node</div>
      <p style={{ marginTop: 8 }}>
        <strong>Tx Hash:</strong>
        <br />
        <span style={{ wordWrap: "break-word" }}>{txHash || "No transaction broadcasted"}</span>
      </p>
      <button onClick={handleBroadcast} disabled={broadcasting || !providerUrl || !signedTx}>
        {broadcasting ? "Broadcasting..." : "Broadcast Transaction"}
      </button>

      {/* Target handle for the blockchain provider URL */}
      <LabeledHandle
        title="Provider URL"
        type="target"
        position={Position.Left}
        id="provider"
        style={{ top: "40%" }}
        isConnectable={inputConnections.filter((conn) => conn.targetHandle === "provider").length === 0}
      />
      {/* Target handle for the signed transaction */}
      <LabeledHandle
        title="Transaction"
        type="target"
        position={Position.Left}
        id="tx"
        style={{ top: "70%" }}
        isConnectable={inputConnections.filter((conn) => conn.targetHandle === "tx").length === 0}
      />
      {/* Source handle to output the transaction hash */}
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
};

export default BroadcastTransactionNode;
