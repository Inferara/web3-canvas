import React from "react";
import {
  NodeProps,
  Handle,
  Position,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import { KeyPairNodeProps } from "../cryptography/KeyPair";
import W3CNode from "../../W3CNode";

interface TextViewNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;
    out?: string;
  };
}

const TextViewNode: React.FC<TextViewNodeProps> = ({id}) => {
  const inputConnections = useNodeConnections({
    handleType: 'target',
  });
  const nodeData = useNodesData(inputConnections[0]?.source);
  let text = "";
  if (inputConnections) {
    if (nodeData?.type === "keypair") {
      text = Utf8DataTransfer.readStringFromKeyPairNode(nodeData as KeyPairNodeProps,  inputConnections[0]?.sourceHandle as string);
    } else {
      text = nodeData ? Utf8DataTransfer.decodeString(nodeData?.data.out as string) : "";
    }
  }

  function copyToClipboard(textToCopy: string) {
    // Navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy);
    } else {
        // Use the 'out of viewport hidden text area' trick
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
            
        // Move textarea out of the viewport so it's not visible
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
            
        document.body.prepend(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (error) {
            console.error(error);
        } finally {
            textArea.remove();
        }
    }
}

  return (
    <W3CNode id={id} label="View" isRezieable={true} isGood={text.length > 0} minHeight={130}>
      <textarea value={text || "..."} readOnly={true} className="nodrag"/>
      <Handle type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0}/>
      <button onClick={() => copyToClipboard(text)}>📋</button>
    </W3CNode>
  );
};

const MemoizedTextViewNode = React.memo(TextViewNode);
export default MemoizedTextViewNode;
