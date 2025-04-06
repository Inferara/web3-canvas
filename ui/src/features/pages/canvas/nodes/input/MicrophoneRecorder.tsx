import React, { useState, useRef } from "react";
import { NodeProps, useReactFlow, Position } from "@xyflow/react";
import { keccak256, toUtf8Bytes } from "ethers";
import { Utf8DataTransfer } from "../../utils/Utf8DataTransfer";
import W3CNode from "../../common/W3CNode";
import LabeledHandle from "../../common/LabeledHandle";

interface MicrophoneRecorderNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;   // Not used, but included for consistency.
    out?: string;  // This will store the computed hash of the recorded audio.
    label?: string;
  };
}

const DEFAULT_LABEL = "Microphone Recorder";

const MicrophoneRecorderNode: React.FC<MicrophoneRecorderNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [recordedSize, setRecordedSize] = useState<number>(0);

  // Use refs to hold the MediaRecorder instance and recorded audio chunks.
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Start recording from the user's microphone.
  const startRecording = async () => {
    setError("");
    recordedChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Combine the recorded chunks into a single Blob.
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        setRecordedSize(blob.size);
        // Convert the Blob to a base64 string.
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result?.toString();
          if (base64) {
            // Compute a keccak256 hash of the base64 audio data.
            const hash = keccak256(toUtf8Bytes(base64));
            const dataOut = Utf8DataTransfer.encodeString(hash);
            // Update node data with the computed hash.
            updateNodeData(id, { ...data, out: dataOut });
          }
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Recording error:", err);
      setError("Microphone access denied or not available.");
    }
  };

  // Stop recording and process the recorded audio.
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Use the provided label or fall back to the default.
  const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

  return (
    <W3CNode id={id} label={headerLabel} isGood={recordedSize > 0}>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      {error && <div style={{ color: "red", marginTop: "0.5rem" }}>{error}</div>}
      {recordedSize > 0 && (
        <div style={{ marginTop: "0.5rem" }}>
          Recorded Audio: {recordedSize} bytes
        </div>
      )}
      <LabeledHandle label="out" type="source" position={Position.Right} id="output" />
    </W3CNode>
  );
};

export default MicrophoneRecorderNode;
