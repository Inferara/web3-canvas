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

interface SeedPhraseNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;   // Not used here, included for consistency
    out?: string;  // We'll store the generated seed phrase here
  };
}

const SeedPhraseNode: React.FC<SeedPhraseNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();

  // Local state for the generated seed phrase
  const [seedPhrase, setSeedPhrase] = useState<string>(data.out ?? "");

  // Sync local state if `data.out` changes externally (e.g. loaded from a saved flow)
  useEffect(() => {
    if (data.out !== undefined && data.out !== seedPhrase) {
      setSeedPhrase(data.out);
    }
  }, [data.out, seedPhrase]);

  // Generate a new 20-word phrase when user clicks the button
  const handleGenerate = () => {
    // Generate 20 random words and join them with spaces
    const newPhrase = generate({ exactly: 20, join: " " });
    setSeedPhrase(newPhrase);

    // Update node data so other nodes can read the new phrase
    if (newPhrase !== data.out) {
      updateNodeData(id, { ...data, out: newPhrase });
    }
  };

  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 200 }}>
      <div>Seed Phrase Node</div>
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
