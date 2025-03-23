import { useReactFlow } from '@xyflow/react';
import { memo, useState, useRef, useEffect } from 'react';

interface DrawingNodeProps {
  id: string;
  data: {
    drawing?: string;      // saved drawing as base64 image data
    brushColor?: string;
    brushSize?: number;
  };
}

const DrawingNode: React.FC<DrawingNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [brushColor, setBrushColor] = useState(data.brushColor || "#000000");
  const [brushSize, setBrushSize] = useState(data.brushSize || 4);
  const [drawingData, setDrawingData] = useState(data.drawing || "");

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  // Load saved drawing into the canvas when entering edit mode
  useEffect(() => {
    if (isEditing && canvasRef.current && drawingData) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const img = new Image();
        img.src = drawingData;
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
      }
    }
  }, [isEditing, drawingData]);

  // Start drawing on mouse down
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setLastPoint({ x, y });
  };

  // Draw on mouse move
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !lastPoint) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      setLastPoint({ x, y });
    }
  };

  // End drawing on mouse up or leave
  const endDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  // Clear the canvas without saving the change until the user explicitly saves
  const clearCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Optionally reset the drawingData state if you want to reflect the cleared state immediately:
        setDrawingData("");
      }
    }
  };

  // Save the drawing from canvas and update the node data
  const handleSave = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      setDrawingData(dataUrl);
      updateNodeData(id, {
        drawing: dataUrl,
        brushColor,
        brushSize,
      });
    }
    setIsEditing(false);
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '8px', position: 'relative' }}>
      {isEditing ? (
        <div>
          <canvas
            ref={canvasRef}
            width={300}
            height={200}
            style={{ border: '1px solid #ddd', cursor: 'crosshair' }}
            className='nodrag'
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
          />
          <div style={{ marginTop: '8px' }}>
            <div className="color-control nodrag" style={{ marginBottom: '4px' }}>
              <label htmlFor="brushColor">Brush Color:</label>
              <input
                id="brushColor"
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
              />
            </div>
            <div className="brush-size-control nodrag" style={{ marginBottom: '4px' }}>
              <label htmlFor="brushSize">Brush Size:</label>
              <input
                id="brushSize"
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
              />
              <span>{brushSize}px</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={clearCanvas}>Clear</button>
              <button onClick={handleSave}>Save Drawing</button>
            </div>
          </div>
        </div>
      ) : (
        <div onClick={() => setIsEditing(true)}>
          {drawingData ? (
            <img
              src={drawingData}
              alt="Drawing"
              style={{ width: '100%', height: 'auto', cursor: 'pointer' }}
            />
          ) : (
            <div
              style={{
                width: 300,
                height: 200,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f9f9f9',
                cursor: 'pointer',
              }}
            >
              <span>Click to Edit Drawing</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(DrawingNode);
