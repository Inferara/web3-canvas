import React, {  } from "react";
import { NodeProps } from "@xyflow/react";
import W3CNode from "../../W3CNode";
import { Transaction, W3CDatabase } from "../../infrastructure/Database";

interface LedgerNodeProps extends NodeProps {
    id: string;
    data: {
        in?: string;
        out?: string;
        label?: string;
    };
}

const DEFAULT_LABEL = "Ledger";

const LedgerNode: React.FC<LedgerNodeProps> = ({ id, data }) => {
    const db = W3CDatabase.getInstance();
    const transactions: Transaction[] = db.getTransactions();

    return (
        <W3CNode id={id} isResizeable={true} label={data.label || DEFAULT_LABEL} isGood={transactions.length > 0} minWidth={370} minHeight={200}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th style={{ borderBottom: "2px solid #ddd", padding: "8px", textAlign: "left" }}>Transaction ID</th>
                        <th style={{ borderBottom: "2px solid #ddd", padding: "8px", textAlign: "left" }}>From</th>
                        <th style={{ borderBottom: "2px solid #ddd", padding: "8px", textAlign: "left" }}>To</th>
                        <th style={{ borderBottom: "2px solid #ddd", padding: "8px", textAlign: "left" }}>Amount</th>
                        <th style={{ borderBottom: "2px solid #ddd", padding: "8px", textAlign: "left" }}>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction) => (
                        <tr key={transaction.id} style={{ borderBottom: "1px solid #ddd" }}>
                            <td style={{ padding: "8px" }}>{transaction.id}</td>
                            <td style={{ padding: "8px" }}>{transaction.from}</td>
                            <td style={{ padding: "8px" }}>{transaction.to}</td>
                            <td style={{ padding: "8px" }}>{transaction.amount}</td>
                            <td style={{ padding: "8px" }}>{transaction.timestamp}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </W3CNode>
    );
};

export default LedgerNode;
