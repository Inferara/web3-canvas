import React, { useEffect, useState, ChangeEvent } from "react";
import {
  NodeProps,
  Handle,
  Position,
  useReactFlow,
} from "@xyflow/react";

import { Utf8DataTransfer } from "../Utf8DataTransfer";

interface FileInputNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;   // Not used here, but present for consistency
    out?: string;  // We'll store base64 or file name in out
  };
}

const FileInputNode: React.FC<FileInputNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const [fileData, setFileData] = useState<Uint8Array>(data.out ? Utf8DataTransfer.unpack(data.out) : new Uint8Array());

  // Handler for file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read file as base64
    const reader = new FileReader();
    reader.onload = () => {
      let base64 = reader.result;
      if (typeof base64 === 'string') {
        base64 = base64.split(",")[1];
        const byteArray = Utf8DataTransfer.decodeByteArray('B' + base64);
        setFileData(byteArray);
        // Persist in node data
        const dataOut = 'B' + base64;
        updateNodeData(id, { ...data, out: dataOut });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 150 }}>
      <div>File Input Node</div>
      <input
        type="file"
        onChange={handleFileChange}
        style={{ marginTop: 8 }}
        className="nodrag"
      />
      {/* Show some info about the current file data */}
      <div style={{ marginTop: 8 }}>
        {fileData
          ? <small>{fileData.slice(0, 30)}...</small>
          : "No file selected."}
      </div>
      {/* Source handle so other nodes can read the file content */}
      <Handle type="source" position={Position.Bottom} id="output" />
    </div>
  );
};

export default FileInputNode;
