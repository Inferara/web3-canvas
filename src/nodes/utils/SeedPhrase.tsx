import React, { useEffect, useState } from "react";
import {
  NodeProps,
  Handle,
  Position,
  useReactFlow,
} from "@xyflow/react";

// If you haven't already, install random-words:
// npm install random-words
import { generate } from "random-words";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";

interface SeedPhraseNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;   // Not used here, included for consistency
    out?: string;  // We'll store the generated seed phrase here
  };
}

const SeedPhraseNode: React.FC<SeedPhraseNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const [seedPhrase, setSeedPhrase] = useState<string>("");

  useEffect(() => {
    const outData = Utf8DataTransfer.decodeString(seedPhrase as string);
    updateNodeData(id, { ...data, out: outData });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedPhrase]);

  const handleGenerate = () => {
    setSeedPhrase(generate({ exactly: 20, join: " " }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 200 }}>
      <button onClick={handleGenerate} style={{ marginTop: 8 }}>
        Generate Seed
      </button>

      {/* Display the seed phrase (or a message if none) */}
      <div style={{ marginTop: 8 }}>
        {seedPhrase || "No seed phrase generated yet."}
      </div>

      {/* Only a source handle, since this node just outputs data */}
      <Handle type="source" position={Position.Bottom} id="output" />
    </div>
  );
};

export default SeedPhraseNode;
