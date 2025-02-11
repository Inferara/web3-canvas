import React from 'react';
import { useW3C } from './W3CContext';

interface SidebarProps {
    onSave: () => void;
    onRestore: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({onSave, onRestore}) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, setType] = useW3C();

    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
        setType(nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside>
            <div className='appname'>Web3 キャンバス</div>
            <div className="saveRestoreButtonsContainer">
                <button onClick={onSave}>save</button>
                <button onClick={onRestore}>restore</button>
            </div>
            <div className='description'>Cryptography</div>
            <hr />
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "encrypt")} draggable>
                Encrypt
            </div>
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "decrypt")} draggable>
                Decrypt
            </div>
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "hash")} draggable>
                Hash
            </div>
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "keypair")} draggable>
                Key Pair
            </div>
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "signMessage")} draggable>
                Sign Message
            </div>
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "verifySignature")} draggable>
                Verify Signature
            </div>
            
            <div className='description'>Inputs</div>
            <hr />
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "textInput")} draggable>
                Text Input
            </div>
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "numberInput")} draggable>
                Number Input
            </div>
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "fileInput")} draggable>
                File Input
            </div>

            <div className='description'>View</div>
            <hr />
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "textView")} draggable>
                Text View
            </div>
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "qr")} draggable>
                QR Code
            </div>
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "color")} draggable>
                Color
            </div>

            <div className='description'>Web3</div>
            <hr />
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "balance")} draggable>
                Balance
            </div>
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "ethToUsd")} draggable>
                ETH to USD
            </div>
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "makeTransaction")} draggable>
                Make Transaction
            </div>
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "broadcastTrascation")} draggable>
                Broadcast Transaction
            </div>

            <div className='description'>Utils</div>
            <hr />
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "compound")} draggable>
                Compound
            </div>
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "substring")} draggable>
                Substring
            </div>
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "length")} draggable>
                Length
            </div>
            <div className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, "seed")} draggable>
                Seed Phrase
            </div>
        </aside>
    )
}

export default Sidebar;
