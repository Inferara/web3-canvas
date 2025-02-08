import React, { ChangeEvent, useState } from "react";
import {
  NodeProps,
  Handle,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { ethers } from "ethers";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";

interface FileInputNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;   // Not used here, but present for consistency
    out?: string;  // We'll store base64 or file name in out
  };
}

const FileInputNode: React.FC<FileInputNodeProps> = ({ id, data }) => {
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read file as base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result?.toString();
      if (base64) {
        setFileSize(base64.length);
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(base64 as string));
        const dataOut = Utf8DataTransfer.encodeString(hash);
        updateNodeData(id, { ...data, out: dataOut });
      }
    };
    reader.readAsDataURL(file);
  };
  const { updateNodeData } = useReactFlow();
  const [fileSize, setFileSize] = useState<number>(0);

  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 150 }}>
      <input
        type="file"
        onChange={handleFileChange}
        style={{ marginTop: 8 }}
        className="nodrag"
      />
      {/* Show some info about the current file data */}
      <div style={{ marginTop: 8 }}>
        {(fileSize > 0)
          ? <small>{fileSize} bytes</small>
          : "No file selected."}
      </div>
      {/* Source handle so other nodes can read the file content */}
      <Handle type="source" position={Position.Bottom} id="output" />
    </div>
  );
};

const MemoizedFileInputNode = React.memo(FileInputNode);
export default MemoizedFileInputNode;

