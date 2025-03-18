import { memo } from 'react';

interface AnnotationNodeProps {
    data: {
        level: number;
        label: string;
        arrowStyle?: React.CSSProperties;
    };
}

function AnnotationNode({ data }: AnnotationNodeProps) {
    data = {
        level: 1,
        label: 'Annotation',
        arrowStyle: {
            position: 'absolute',
            top: '50%',
            right: '-8px',
            transform: 'translateY(-50%)',
            fontSize: '10px',
            color: 'rgba(0,0,0,0.4)',
        },
    }
    return (
        <>
            <div className='annotation-content'>
                <div className='annotation-level'>{data.level}.</div>
                <div>{data.label}</div>
            </div>
            {data.arrowStyle && (
                <div className="annotation-arrow" style={data.arrowStyle}>
                    ⤹
                </div>
            )}
        </>
    );
}

export default memo(AnnotationNode);
