import React, { ChangeEvent, useState } from "react";
import {
  NodeProps,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { keccak256, toUtf8Bytes } from "ethers";
import { Utf8DataTransfer } from "../../utils/Utf8DataTransfer";
import W3CNode from "../../common/W3CNode";
import LabeledHandle from "../../common/LabeledHandle";

interface FileInputNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;   // Not used here, but present for consistency
    out?: string;  // We'll store base64 or file name in out
    label?: string;
  };
}

const DEFAULT_LABEL = "File Input";

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
        setFileName(file.name);
        const hash = keccak256(toUtf8Bytes(base64 as string));
        const dataOut = Utf8DataTransfer.encodeString(hash);
        updateNodeData(id, { ...data, out: dataOut });
      }
    };
    reader.readAsDataURL(file);
  };
  const { updateNodeData } = useReactFlow();
  const [fileSize, setFileSize] = useState<number>(0);
  const [fileName, setFileName] = useState<string>("");

  // If data.label is empty (or null), use the default.
  const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

  return (
    <W3CNode id={id} label={headerLabel} isGood={fileSize > 0}>
      <label htmlFor="file-upload" style={{ fontSize: 'x-large' }}>📂</label>
      <input
        id="file-upload"
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        className="nodrag"
      />
      <div>{fileName}: {fileSize} bytes</div>
      <LabeledHandle label="out" type="source" position={Position.Right} id="output" />
    </W3CNode>
  );
};

export default FileInputNode;
