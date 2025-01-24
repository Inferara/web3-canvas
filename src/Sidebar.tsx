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
            
            <div className='description'>Inputs</div>
            <hr />
            <div className='w3cflownode' onDragStart={(event) => onDragStart(event, "textInput")} draggable>
                Text Input
            </div>
            <div className='w3cflownode broken' onDragStart={(event) => onDragStart(event, "numberInput")} draggable>
                Number Input
            </div>
            <div className='w3cflownode broken' onDragStart={(event) => onDragStart(event, "fileInput")} draggable>
                File Input
            </div>

            <div className='description'>View</div>
            <hr />
            <div className='w3cflownode' onDragStart={(event) => onDragStart(event, "textView")} draggable>
                Text View
            </div>
            <div className='w3cflownode' onDragStart={(event) => onDragStart(event, "qr")} draggable>
                QR Code
            </div>
            <div className='w3cflownode' onDragStart={(event) => onDragStart(event, "color")} draggable>
                Color
            </div>

            <div className='description'>Crypto</div>
            <hr />
            <div className='w3cflownode' onDragStart={(event) => onDragStart(event, "hash")} draggable>
                Hash
            </div>
            <div className='w3cflownode broken' onDragStart={(event) => onDragStart(event, "keypair")} draggable>
                Key Pair
            </div>
            <div className='w3cflownode broken' onDragStart={(event) => onDragStart(event, "signMessage")} draggable>
                Sign Message
            </div>
            <div className='w3cflownode broken' onDragStart={(event) => onDragStart(event, "verifySignature")} draggable>
                Verify Signature
            </div>

            <div className='description'>Utils</div>
            <hr />
            <div className='w3cflownode' onDragStart={(event) => onDragStart(event, "compound")} draggable>
                Compound
            </div>
            <div className='w3cflownode' onDragStart={(event) => onDragStart(event, "substring")} draggable>
                Substring
            </div>
            <div className='w3cflownode' onDragStart={(event) => onDragStart(event, "length")} draggable>
                Length
            </div>
            <div className='w3cflownode broken' onDragStart={(event) => onDragStart(event, "seed")} draggable>
                Seed Phrase
            </div>

        </aside>
    )
}

export default Sidebar;
