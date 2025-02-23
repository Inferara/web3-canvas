import React, { useEffect, useState } from "react";
import {
  NodeProps,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import { Utf8DataTransfer } from "../../Utf8DataTransfer";
import W3CNode from "../../W3CNode";
import LabeledHandle from "../../LabeledHandle";

interface EthToUsdNodeProps extends NodeProps {
  id: string;
  data: {
    in?: object;
    out?: string;
    label?: string;
  };
}

const DEFAULT_LABEL = "ETH to USD"

const EthToUsdNode: React.FC<EthToUsdNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  // Get all target connections for this node.
  const inputConnections = useNodeConnections({ handleType: "target" });
  
  // Find the connection on our designated "input" handle.
  const inputConnection = inputConnections.find(
    (conn) => conn.targetHandle === "input"
  );
  const inputNodeData = useNodesData(inputConnection?.source as string);

  // Decode the ETH amount from the connected node.
  const ethValueString = inputNodeData
    ? Utf8DataTransfer.decodeString(inputNodeData.data.out as string)
    : "";
  const ethValue = parseFloat(ethValueString);

  // Local state to hold the USD conversion result.
  const [usdValue, setUsdValue] = useState<string>("");

  useEffect(() => {
    async function fetchConversion() {
      // Only run if we have a valid ETH value.
      if (!isNaN(ethValue)) {
        try {
          // Fetch the ETH-USD conversion rate from CoinGecko.
          const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
          );
          const conversionData = await response.json();
          const rate = conversionData?.ethereum?.usd;
          if (rate) {
            // Multiply the ETH amount by the conversion rate.
            const usdAmount = ethValue * rate;
            // Round to two decimals for readability.
            const usdFormatted = usdAmount.toFixed(2);
            setUsdValue(usdFormatted);
            // Update this node's output data.
            updateNodeData(id, {
              out: Utf8DataTransfer.encodeString(usdFormatted),
            });
          } else {
            setUsdValue("Error");
            updateNodeData(id, { out: Utf8DataTransfer.encodeString("Error") });
          }
        } catch (error) {
          console.error("Error fetching conversion rate:", error);
          setUsdValue("Error");
          updateNodeData(id, { out: Utf8DataTransfer.encodeString("Error") });
        }
      } else {
        // If the input is invalid or missing, clear the output.
        setUsdValue("");
        updateNodeData(id, { out: Utf8DataTransfer.encodeString("") });
      }
    }
    fetchConversion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethValue]);

  // If data.label is empty (or null), use the default.
  const headerLabel = data.label && data.label.trim() ? data.label : DEFAULT_LABEL;

  return (
    <W3CNode id={id} label={headerLabel} isGood={usdValue !== "Error" && !isNaN(Number(usdValue))}>
      <div>{usdValue || "..."}</div>
      <LabeledHandle
        label="ETH"
        type="target"
        position={Position.Left}
        id="input"
        isConnectable={
          inputConnections.filter((conn) => conn.targetHandle === "input")
            .length === 0
        }
      />

      <LabeledHandle label="usd" type="source" position={Position.Right} id="output" />
    </W3CNode>
  );
};

export default EthToUsdNode;
