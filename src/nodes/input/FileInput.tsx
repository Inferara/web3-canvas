import React, { ChangeEvent, useState } from "react";
import {
  NodeProps,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { ethers } from "ethers";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import W3CNode from "../../W3CNode";
import LabeledHandle from "../../LabeledHandle";

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
    <W3CNode id={id} label="File Input" isGood={fileSize > 0}>
      <label htmlFor="file-upload" style={{fontSize: 'x-large'}}>📂</label>
      <input
          id="file-upload"
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          className="nodrag"
      />
      <div>File size: {fileSize}</div>
      <LabeledHandle label="out" type="source" position={Position.Bottom} id="output" />
    </W3CNode>
  );
};

export default FileInputNode;
