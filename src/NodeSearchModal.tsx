import React, { useEffect, useRef, useState, useCallback, KeyboardEvent } from 'react';
import { nodeTypesCategorized } from './App';

export interface NodeOption {
  type: string;
  label: string;
}

export interface NodeSearchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectNode: (option: NodeOption) => void;
}

const NodeSearchModal: React.FC<NodeSearchModalProps> = ({ isVisible, onClose, onSelectNode }) => {
  const [search, setSearch] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const nodeOptions: NodeOption[] = [];
  Object.entries(nodeTypesCategorized).map(([_, nodes]) => (
    Object.entries(nodes).map(([nodeType, node]) => (
      nodeOptions.push({ type: nodeType, label: node.label })
    ))
  ));

  // Filter node options based on search term.
  const filteredOptions = nodeOptions.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  // Focus input when modal becomes visible.
  useEffect(() => {
    if (isVisible) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isVisible]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement> | KeyboardEvent) => {
      if (!isVisible) return;

      if (e.code === 'Escape') {
        onClose();
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.code === 'Enter') {
        e.preventDefault();
        if (filteredOptions[selectedIndex]) {
          onSelectNode(filteredOptions[selectedIndex]);
        }
      }
    },
    [isVisible, filteredOptions, selectedIndex, onSelectNode, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown as any);
    return () => window.removeEventListener('keydown', handleKeyDown as any);
  }, [handleKeyDown]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 50,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        background: 'white',
        padding: 20,
        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
      }}
    >
      <input
        ref={inputRef}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setSelectedIndex(0);
        }}
        placeholder="Search nodes..."
        style={{ width: 300, padding: 8 }}
      />
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {filteredOptions.map((option, i) => (
          <li
            key={option.type}
            style={{
              padding: '5px 10px',
              background: i === selectedIndex ? '#eee' : 'transparent',
            }}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NodeSearchModal;
