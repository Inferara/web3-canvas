import React, { useEffect, useState } from "react";
import {
  NodeProps,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import { Wallet } from 'ethers';
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import W3CNode from "../../W3CNode";
import LabeledHandle from "../../LabeledHandle";

interface SignMessageNodeProps extends NodeProps {
  id: string;
  data: {
    in?: object;
    out?: string;
    label?: string;
  };
}

const DEFAULT_LABEL = "Sign Message";

const SignMessageNode: React.FC<SignMessageNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const inputConnections = useNodeConnections({ handleType: 'target' });
  const [signature, setSignature] = useState<string>("");
  const nd1 = useNodesData(inputConnections[0]?.source);
  const nd2 = useNodesData(inputConnections[1]?.source);

  if (nd1 && nd2) {
    const nodesData = [nd1, nd2];
    const msgConnection = inputConnections.find((conn) => conn.targetHandle === "msg");
    const messageNodeData = nodesData.find((nd) => nd.id === msgConnection?.source);
    const message = Utf8DataTransfer.tryDecodeString(messageNodeData, msgConnection?.sourceHandle);
    const privKeyConnection = inputConnections.find((conn) => conn.targetHandle === "privKey");
    const privKeyNodeData = nodesData.find((nd) => nd.id === privKeyConnection?.source);
    const privateKey = Utf8DataTransfer.tryDecodeString(privKeyNodeData, privKeyConnection?.sourceHandle);
    if (privateKey) {
    const wallet = new Wallet(privateKey);
      wallet.signMessage(message).then((signResult) => {
        if (signResult !== signature) setSignature(signResult);
      });
    } else if (signature) {
      setSignature("");
    }
  }

  useEffect(() => {
    updateNodeData(id, { ...data, out: Utf8DataTransfer.encodeString(signature) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  // If data.label is empty (or null), use the default.
  const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

  return (
    <W3CNode id={id} label={headerLabel} isGood={signature.length > 0}>
      <div>{signature.substring(0, 25) + "..." || "..."}</div>
      <LabeledHandle
        label="msg"
        type="target"
        position={Position.Left}
        id="msg"
        style={{ top: "50%" }}
        isConnectable={inputConnections.filter((conn) => conn.targetHandle === "msg").length === 0}
      />
      <LabeledHandle
        label="priv key"
        type="target"
        position={Position.Left}
        id="privKey"
        style={{ top: "80%" }}
        isConnectable={inputConnections.filter((conn) => { conn.targetHandle === "privKey" }).length === 0}
      />
      <LabeledHandle
        label="sig"
        type="source"
        position={Position.Right}
        id="output"
      />
    </W3CNode>
  );
};

export default SignMessageNode;
