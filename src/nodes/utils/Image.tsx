import { NodeResizer, useReactFlow } from '@xyflow/react';
import { memo, useState, useEffect } from 'react';

interface ImageNodeProps {
  id: string;
  data: {
    image?: string; // saved image as a base64 data URL
  };
}

const ImageNode: React.FC<ImageNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [imageData, setImageData] = useState(data.image || "");

  // Update node data when imageData changes
  useEffect(() => {
    updateNodeData(id, {
      image: imageData,
    });
  }, [imageData, id, updateNodeData]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageData(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <NodeResizer minWidth={50} minHeight={50} />
      <div
        style={{
          border: '1px solid #ccc',
          padding: '8px',
          position: 'relative',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        {isEditing ? (
          <div style={{ width: '100%', height: '100%' }}>
            <div style={{ marginBottom: '8px' }} className="nodrag">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <button onClick={() => setIsEditing(false)} style={{ marginLeft: '8px' }}>
                Save
              </button>
            </div>
            <div
              style={{
                width: '100%',
                height: 'calc(100% - 40px)',
                overflow: 'hidden',
                border: '1px solid #ddd',
              }}
            >
              {imageData && (
                <img
                  src={imageData}
                  alt="Selected"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            style={{ cursor: 'pointer', width: '100%', height: '100%' }}
          >
            {imageData ? (
              <img
                src={imageData}
                alt="Uploaded"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <span>Click to upload image</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default memo(ImageNode);
