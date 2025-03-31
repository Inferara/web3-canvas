import React, {  useState,  useCallback } from "react";
import {
  NodeProps,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { Utf8DataTransfer } from "../../utils/Utf8DataTransfer";
import W3CNode from "../../common/W3CNode";
import LabeledHandle from "../../common/LabeledHandle";

interface NumberInputNodeProps extends NodeProps {
  id: string;
  data: {
    in?: string;   // Not used here, but present for consistency
    out?: string;  // We'll store the numeric value as a string in out
    label?: string;
  };
}

const DEFAULT_LABEL = "Number Input";

const NumberInputNode: React.FC<NumberInputNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const [numberValue, setNumber] = useState<string>(
    data.out ? Utf8DataTransfer.decodeString(data.out) : ""
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setNumber(value);
      const newData = Utf8DataTransfer.encodeString(value);
      updateNodeData(id, { ...data, out: newData });
    },
    [updateNodeData, id, data]
  );

  const onStepChange = useCallback(
    (isIncrement: boolean) => {
      const currentValue = parseFloat(numberValue) || 0;
      let step = 1; // default step for integer
      let precision = 0; // no decimal digits

      if (numberValue.includes(".")) {
        // It is considered a float. Determine precision from the fractional part.
        const decimalIndex = numberValue.indexOf(".");
        const fractionalPart = numberValue.substring(decimalIndex + 1);
        // If the user left the fractional part empty (e.g. "3."), assume one digit.
        precision = fractionalPart.length > 0 ? fractionalPart.length : 1;
        step = Math.pow(10, -precision);
      }

      const newValue = isIncrement ? currentValue + step : currentValue - step;
      // If we are in float mode, format the number with the same precision.
      const newValueStr = precision > 0 ? newValue.toFixed(precision) : newValue.toString();
      setNumber(newValueStr);
      const newData = Utf8DataTransfer.encodeString(newValueStr);
      updateNodeData(id, { ...data, out: newData });
    },
    [numberValue, updateNodeData, id, data]
  );

  const headerLabel =
    data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

  return (
    <W3CNode id={id} label={headerLabel} isGood={true}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <input
          type="number"
          value={numberValue}
          onChange={handleChange}
          className="nodrag"
          style={{ width: 100 }}
          step="any"
        />
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 10, height: 40 }}>
          <button style={{flex: 1, fontSize: 12, }} onClick={() => onStepChange(true)}>⤴️</button>
          <button style={{flex: 1, fontSize: 12, }} onClick={() => onStepChange(false)}>⤵️</button>
        </div>
      </div>
      <LabeledHandle label="out" type="source" position={Position.Right} id="output" />
    </W3CNode>
  );
};


export default NumberInputNode;
