import { useReactFlow } from '@xyflow/react';
import { memo, useState, useEffect } from 'react';

interface AnnotationNodeProps {
    id : string;
    data: {
        label: string;
        arrowRotation: number;
        color: string;
    };
}

const AnnotationNode: React.FC<AnnotationNodeProps> = ({ id, data }) => {
    const { updateNodeData } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [headerText, setHeaderText] = useState(data.label ?? "Double click to edit");
    const [rotation, setRotation] = useState(data.arrowRotation ?? 0);
    const [color, setColor] = useState(data.color ?? "#c02626");

    // Save rotation state whenever it changes
    useEffect(() => {
        updateNodeData(id, {
            label: headerText,
            arrowRotation: rotation,
            color: color,
        });
    }, [rotation, headerText, color]);

    // Merge the provided arrowStyle with our rotation transformation and color
    const arrowStyle = {
        transform: `rotate(${rotation}deg)`,
        color: color, // set arrow color
    };

    // Apply the selected color to the text style
    const textStyle = {
        color: color,
    };

    return (
        <div>
            {isEditing ? (
                <div>
                    <textarea
                        value={headerText}
                        onChange={(e) => setHeaderText(e.target.value)}
                        autoFocus
                    />

                    <div className="rotation-control nodrag">
                        <label htmlFor="rotationRange">Rotate Arrow:</label>
                        <input
                            id="rotationRange"
                            type="range"
                            min="0"
                            max="360"
                            value={rotation}
                            onChange={(e) => setRotation(Number(e.target.value))}
                        />
                        <span>{rotation}°</span>
                    </div>

                    <div className="color-control nodrag">
                        <label htmlFor="colorPicker">Select Color:</label>
                        <input
                            id="colorPicker"
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                        />
                    </div>

                    <div>
                        <button onClick={() => setIsEditing(false)}>Save</button>
                    </div>
                </div>
            ) : (
                <div className="annotation-content">
                    <span style={textStyle} onDoubleClick={() => setIsEditing(true)}>
                        {headerText}
                    </span>
                </div>
            )}

            <div className="annotation-arrow" style={arrowStyle}>
                ⤹
            </div>
        </div>
    );
}

export default memo(AnnotationNode);
