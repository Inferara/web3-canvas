import React, { useEffect, useState, ChangeEvent } from "react";
import {
  NodeProps,
  Handle,
  Position,
  useReactFlow,
} from "@xyflow/react";

interface FileInputNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;   // Not used here, but present for consistency
    out?: number[];  // We'll store base64 or file name in out
  };
}

const FileInputNode: React.FC<FileInputNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();

  // Local state for storing either the file's name or base64 content
  const [fileData, setFileData] = useState<number[]>(data.out ?? []);

  // Sync local state if data.out changes externally
  useEffect(() => {
    if (data.out !== undefined && data.out !== fileData) {
      setFileData(data.out);
    }
  }, [data.out, fileData]);

  // Handler for file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read file as base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      if (typeof base64 === 'string') {
        const byteArray = Uint8Array.from(atob(base64.split(',')[1]), c => c.charCodeAt(0));
        setFileData(Array.from(byteArray));
        // Persist in node data
        if (Array.from(byteArray) !== data.out) {
            updateNodeData(id, { ...data, out: base64 });
        }
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
