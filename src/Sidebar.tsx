import React from 'react';
import { useW3C } from './W3CContext';

const Sidebar: React.FC = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, setType] = useW3C();

    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
        setType(nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside>
            <div className='description'>You can drag these nodes to the pane on the right.</div>
            <div className='w3cflownode' onDragStart={(event) => onDragStart(event, "textInput")} draggable>
                Text Input
            </div>
            <div className='w3cflownode' onDragStart={(event) => onDragStart(event, "textView")} draggable>
                Text View
            </div>
            <div className='w3cflownode' onDragStart={(event) => onDragStart(event, "hash")} draggable>
                Hash
            </div>
            <div className='w3cflownode' onDragStart={(event) => onDragStart(event, "compound")} draggable>
                Compound
            </div>
        </aside>
    )
}

export default Sidebar;
