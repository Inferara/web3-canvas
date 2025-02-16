import { NodeResizeControl } from '@xyflow/react';
import React from 'react';
import { ResizeIcon } from './ResizeIcon';

interface W3CNodeProps {
    id: string;
    label: string;
    isRezieable?: boolean;
    style?: React.CSSProperties;
    isGood?: boolean;
    children?: React.ReactNode;
    minWidth?: number;
    minHeight?: number;
}

const W3CNode: React.FC<W3CNodeProps> = ({ id, label, style = {} ,isRezieable = false, isGood = false, children, minWidth = 250, minHeight=100 }) => {
    const headerStyle = isGood ? "w3cflownodeheader good" : "w3cflownodeheader";
    const popUpId = "popup-" + id;
    function togglePopup() {
        const popup = document.getElementById(popUpId);
        popup?.classList.toggle("show");
    }
    return (
        <div style={{ ...style, width: "100%", height: "100%" }}>
            {isRezieable && (
                <NodeResizeControl minWidth={minWidth} minHeight={minHeight}>
                    <ResizeIcon />
                </NodeResizeControl>
            )}
            <div className={headerStyle}>
                {label}
                <span className="question-icon" onClick={togglePopup}>?</span>
            </div>
            <div id={popUpId} className="popup">
                <div className="popup-content" onClick={togglePopup}>
                    <p>This is an input field where you can type text. The node resizes dynamically.</p>
                    <button>Close</button>
                </div>
            </div>
            <div className="w3cflownode">
                {children}
            </div>
        </div>
    );
};

const MemoizedW3CNode = React.memo(W3CNode);
export default MemoizedW3CNode;