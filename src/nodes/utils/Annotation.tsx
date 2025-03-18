import { memo, useState, useEffect } from 'react';

interface AnnotationNodeProps {
    data: {
        level: number;
        label: string;
        arrowStyle?: React.CSSProperties;
    };
}

function AnnotationNode({ data }: AnnotationNodeProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [headerText, setHeaderText] = useState("Double click to edit");
    const [rotation, setRotation] = useState(0);

    // Load saved rotation state from localStorage on mount
    useEffect(() => {
        const savedRotation = localStorage.getItem('arrowRotation');
        if (savedRotation) {
            setRotation(Number(savedRotation));
        }
    }, []);

    // Save rotation state whenever it changes
    useEffect(() => {
        localStorage.setItem('arrowRotation', rotation.toString());
    }, [rotation]);

    // Combine the provided arrowStyle with our rotation transformation
    const arrowStyle = {
        ...data.arrowStyle,
        transform: `rotate(${rotation}deg)`
    };

    return (
        <div>
            {isEditing ? (
                <div>
                    <textarea
                        value={headerText}
                        onChange={(e) => setHeaderText(e.target.value)}
                        //   onBlur={() => setIsEditing(false)}
                        // onKeyDown={(e) => {
                        //     if (e.key === 'Enter') setIsEditing(false);
                        // }}
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
                    <div>
                        <button onClick={() => setIsEditing(false)}>Save</button>
                    </div>
                </div>
            ) : (
                <div className="annotation-content">
                    <span onDoubleClick={() => setIsEditing(true)}>{headerText}</span>
                </div>
            )}

            <div className="annotation-arrow" style={arrowStyle}>
                ⤹
            </div>


        </div>
    );
}

export default memo(AnnotationNode);
