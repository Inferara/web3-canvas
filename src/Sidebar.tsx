import React, { useCallback, useState } from 'react';
import { useW3C } from './W3CContext';
import SavedInstanceItem, { SavedState } from './StatesPanel';
import { Node, Edge, ReactFlowInstance } from '@xyflow/react';
import LZString from 'lz-string';
import { NodeIdProvider } from './App';

interface SidebarProps {
    rfInstance?: ReactFlowInstance<Node, Edge> | null;
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
    createNode: (type: string, x: number, y: number ) => void;
}

const flowKey = 'w3cflow';

const Sidebar: React.FC<SidebarProps> = ({ rfInstance, setNodes, setEdges, createNode }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, setType] = useW3C();
    const [savedStates, setSavedStates] = useState<SavedState[]>([]);
    const [panelVisible, setPanelVisible] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
        setType(nodeType);
        event.dataTransfer.effectAllowed = 'move';
        setIsDragging(true);
    };

    const onDragEnd = () => {
        setIsDragging(false);
    }

    const handleNodeClick = useCallback((nodeType: string) => {
        if (!isDragging) {
            const { innerWidth, innerHeight } = window;
            const x = (innerWidth / 2) - 420;
            const y = (innerHeight / 2) - 100;
            createNode(nodeType, x, y);
        }
    }, []);

    const updateStateName = useCallback((id: number, newName: string) => {
        setSavedStates((prev) =>
            prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
        );
    }, []);

    const deleteState = useCallback((id: number) => {
        setSavedStates((prev) => prev.filter((s) => s.id !== id));
    }, []);

    const moveStateUp = useCallback((index: number) => {
        setSavedStates((prev) => {
            if (index <= 0) return prev;
            const newArray = [...prev];
            [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
            return newArray;
        });
    }, []);

    const moveStateDown = useCallback((index: number) => {
        setSavedStates((prev) => {
            if (index >= prev.length - 1) return prev;
            const newArray = [...prev];
            [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
            return newArray;
        });
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const restoreState = useCallback((flow: any) => {
        if (flow) {
            const { x = 0, y = 0, zoom = 1 } = flow.viewport;
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
            rfInstance?.setViewport({ x, y, zoom });
            NodeIdProvider.id = flow.nodes.length;
        }
    }, [rfInstance, setNodes, setEdges]);

    const handleUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const flow = JSON.parse(reader.result as string);
                restoreState(flow);
            } catch (err) {
                console.error("Failed to parse uploaded file:", err);
            }
        };
        reader.readAsText(file);
    }, [restoreState]);

    const handlePushState = useCallback(() => {
        if (rfInstance) {
            const flow = rfInstance.toObject();
            const timestamp = new Date().toISOString();
            const newSavedState: SavedState = {
                id: Date.now(),
                timestamp,
                name: timestamp, // default name
                flow,
            };
            setSavedStates((prev) => [newSavedState, ...prev]);
        }
    }, [rfInstance]);

    const onDownload = useCallback(() => {
        if (rfInstance) {
            const flow = rfInstance.toObject();
            localStorage.setItem(flowKey, JSON.stringify(flow));
            const flowString = JSON.stringify(flow, null, 2);
            const blob = new Blob([flowString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const timestamp = new Date().toISOString();
            a.download = `flow_${timestamp}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }, [rfInstance]);

    const handleCopyUrl = useCallback(() => {
        if (rfInstance) {
          const flow = rfInstance.toObject();
          const jsonState = JSON.stringify(flow);
          // Compress the state using LZ-string's URL-safe method
          const compressedState = LZString.compressToEncodedURIComponent(jsonState);
          const shareableUrl = `${window.location.origin}${window.location.pathname}?state=${compressedState}`;
          navigator.clipboard.writeText(shareableUrl)
            .then(() => {
              console.log("Shareable URL copied to clipboard:", shareableUrl);
            })
            .catch(err => {
              console.error("Failed to copy URL:", err);
            });
        }
      }, [rfInstance]);

    const cryptographyNodes = [
        "calculateAddress",
        "encrypt",
        "decrypt",
        "hash",
        "keypair",
        "scalarMultiplication",
    ];

    const ethereumNodes = [
        "balance",
        "ethToUsd",
        "makeTransaction",
        "broadcastTransaction",
    ];

    const inputNodes = [
        "textInput",
        "numberInput",
        "fileInput",
    ];

    const viewNodes = [
        "textView",
        "qr",
        "color",
    ];

    const utilsNodes = [
        "bigint",
        "compound",
        "compare",
        "group",
        "substring",
        "length",
        "seed",
        "arithmetic",
    ];

    const actorsNodes = [
        "actor",
        "interval",
        "ledger",
        "makeActorMessage",
        "network",
    ];


    return (
        <aside>
            <div>
                <div className='appname'>Web3 キャンバス</div>
                <div className="saveRestoreButtonsContainer">
                    <button onClick={onDownload}>💾</button>
                    <button onClick={handleCopyUrl}>🔗</button>
                    <label htmlFor="file-upload">📂</label>
                    <input
                        id="file-upload"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleUpload}
                    />
                    <button onClick={() => setPanelVisible((prev) => !prev)}>
                        {panelVisible ? '📕' : '📖'}
                    </button>
                </div>
                <div className='description'>Cryptography</div>
                <hr />
                {cryptographyNodes.map((nodeType) => (
                    <div key={nodeType} className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, nodeType)} onDragEnd={() => onDragEnd()} onClick={() => handleNodeClick(nodeType)} draggable>
                        {nodeType}
                    </div>
                ))}
                <div className='description'>Ethereum</div>
                <hr />
                {ethereumNodes.map((nodeType) => (
                    <div key={nodeType} className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, nodeType)} onDragEnd={() => onDragEnd()} onClick={() => handleNodeClick(nodeType)} draggable>
                        {nodeType}
                    </div>
                ))}
                <div className='description'>Inputs</div>
                <hr />
                {inputNodes.map((nodeType) => (
                    <div key={nodeType} className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, nodeType)} onDragEnd={() => onDragEnd()} onClick={() => handleNodeClick(nodeType)} draggable>
                        {nodeType}
                    </div>
                ))}
                <div className='description'>View</div>
                <hr />
                {viewNodes.map((nodeType) => (
                    <div key={nodeType} className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, nodeType)} onDragEnd={() => onDragEnd()} onClick={() => handleNodeClick(nodeType)} draggable>
                        {nodeType}
                    </div>
                ))}
                <div className='description'>Utils</div>
                <hr />
                {utilsNodes.map((nodeType) => (
                    <div key={nodeType} className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, nodeType)} onDragEnd={() => onDragEnd()} onClick={() => handleNodeClick(nodeType)} draggable>
                        {nodeType}
                    </div>
                ))}
                <div className='description'>Actors</div>
                <hr />
                {actorsNodes.map((nodeType) => (
                    <div key={nodeType} className='w3cflownodeMenuItem' onDragStart={(event) => onDragStart(event, nodeType)} onDragEnd={() => onDragEnd()} onClick={() => handleNodeClick(nodeType)} draggable>
                        {nodeType}
                    </div>
                ))}
            </div>
            {panelVisible && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '40px' }}>
                    <div className="saveRestoreButtonsContainer">
                        <button onClick={handlePushState}>🔽</button>
                    </div>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {savedStates.map((state, index) => (
                            <SavedInstanceItem
                                key={state.id}
                                savedState={state}
                                index={index}
                                totalCount={savedStates.length}
                                onUpdateName={updateStateName}
                                onRestore={restoreState}
                                onDelete={deleteState}
                                onMoveUp={moveStateUp}
                                onMoveDown={moveStateDown}
                            />
                        ))}
                    </ul>
                </div>
            )}
        </aside>
    )
}

export default Sidebar;
