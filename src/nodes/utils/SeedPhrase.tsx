import React, { useEffect, useState } from "react";
import {
  NodeProps,
  Position,
  useReactFlow,
} from "@xyflow/react";

// If you haven't already, install random-words:
// npm install random-words
import { generate } from "random-words";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import W3CNode from "../../W3CNode";
import LabeledHandle from "../../LabeledHandle";

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
    const outData = Utf8DataTransfer.encodeString(seedPhrase as string);
    updateNodeData(id, { ...data, out: outData });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedPhrase]);

  const handleGenerate = () => {
    setSeedPhrase(generate({ exactly: 20, join: " " }));
  };

  return (
    <W3CNode id={id} label="Seed Phrase" isGood={seedPhrase.length > 0} isRezieable={true}>
      <button onClick={handleGenerate} style={{marginTop: '10px'}}>Generate</button>
      <textarea value={seedPhrase || "..."} readOnly={true}/>
      <LabeledHandle label="out" type="source" position={Position.Bottom} id="output" />
    </W3CNode>
  );
};

export default SeedPhraseNode;
