import {Handle, NodeResizeControl, Position, useReactFlow} from '@xyflow/react';
import React, {useState, useEffect} from 'react';
import {ResizeIcon} from './ResizeIcon';

interface W3CNodeProps {
    id: string;
    label: string;
    isResizeable?: boolean;
    style?: React.CSSProperties;
    isGood?: boolean;
    children?: React.ReactNode;
    minWidth?: number;
    minHeight?: number;
}

const W3CNode: React.FC<W3CNodeProps> = ({
                                             id,
                                             label,
                                             style = {},
                                             isResizeable = false,
                                             isGood = false,
                                             children,
                                             minWidth = 250,
                                             minHeight = 100,
                                         }) => {
    const {updateNodeData} = useReactFlow();
    const headerStyle = isGood ? 'w3cflownodeheader good' : 'w3cflownodeheader';
    const popUpId = 'popup-' + id;

    const togglePopup = () => {
        const popup = document.getElementById(popUpId);
        popup?.classList.toggle('show');
    };

    // Local state for editing the header.
    const [isEditing, setIsEditing] = useState(false);
    const [headerText, setHeaderText] = useState(label);

    // Update local state if the label prop changes.
    useEffect(() => {
        setHeaderText(label);
    }, [label]);

    // When editing finishes, simply update with whatever the user typed.
    const finishEditing = () => {
        updateNodeData(id, {label: headerText});
        setIsEditing(false);
    };

    return (
      <div style={{...style, width: '100%', height: '100%'}}>
          {isResizeable && (
            <NodeResizeControl minWidth={minWidth} minHeight={minHeight}>
                <ResizeIcon/>
            </NodeResizeControl>
          )}
          <Handle
                type="source"
                position={Position.Top}
            />
          <div className={headerStyle}>
              {isEditing ? (
                <input
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  onBlur={finishEditing}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') finishEditing();
                  }}
                  autoFocus
                />
              ) : (
                <span onDoubleClick={() => setIsEditing(true)}>{headerText}</span>
              )}
              <span className="question-icon" onClick={togglePopup}>?</span>
          </div>
          <div id={popUpId} className="popup">
              <div className="popup-content" onClick={togglePopup}>
                  <p>
                      This is an input field where you can type text. The node resizes dynamically.
                  </p>
                  <button>Close</button>
              </div>
          </div>
          <div className="w3cflownode">{children}</div>
      </div>
    );
};

export default React.memo(W3CNode);
