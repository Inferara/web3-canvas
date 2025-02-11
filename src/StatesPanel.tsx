import { useState } from "react";

export type SavedState = {
  id: number;
  timestamp: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flow: any;
};

type SavedInstanceItemProps = {
  savedState: SavedState;
  index: number;
  totalCount: number;
  onUpdateName: (id: number, newName: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRestore: (flow: any) => void;
  onDelete: (id: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
};

const SavedInstanceItem: React.FC<SavedInstanceItemProps> = ({
  savedState,
  index,
  totalCount,
  onUpdateName,
  onRestore,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(savedState.name);

  const handleEditClick = () => setEditing(true);
  const handleConfirmClick = () => {
    onUpdateName(savedState.id, name);
    setEditing(false);
  };

  return (
    <li style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
      {editing ? (
        <>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginRight: '5px' }}
          />
          <button onClick={handleConfirmClick}>✔️</button>
        </>
      ) : (
        <>
          <span style={{ marginRight: '5px' }}>{savedState.name}</span>
          <button onClick={handleEditClick}>✏️</button>
        </>
      )}
      <button onClick={() => onDelete(savedState.id)} style={{ marginLeft: '5px' }}>
        🗑️
      </button>
      <button onClick={() => onMoveUp(index)} disabled={index === 0} style={{ marginLeft: '5px' }}>
        ⬆️
      </button>
      <button
        onClick={() => onMoveDown(index)}
        disabled={index === totalCount - 1}
        style={{ marginLeft: '5px' }}
      >
        ⬇️
      </button>
      <button onClick={() => onRestore(savedState.flow)} style={{ marginLeft: '10px' }}>
        Restore
      </button>
    </li>
  );
};

export default SavedInstanceItem;
