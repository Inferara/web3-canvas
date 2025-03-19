import React, { useEffect, useRef } from 'react';

export class ContentItem {
  Index: number = 0;
  Color: string = '#000000';
  Content: string = '';
  Value: string = '';
  Location: ContentPointItem[] | ContentPointItem = [];
  Confidence: number = 0;
  Base64: string = '';
}

export class ContentPointItem {
  X: number = 0;
  Y: number = 0;
}

export interface RectangleCanvasProps {
  contentItems: ContentItem[];
  base64file: string | undefined;
  style?: React.CSSProperties | undefined;
}

export const RectangleCanvas: React.FC<RectangleCanvasProps> = ({ contentItems, base64file, style }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showLabels, setShowLabels] = React.useState(true);

  useEffect(() => {
    if (!base64file) {
      return;
    }
    const byteCharacters = atob(base64file);
    const byteNumbers = new Array(byteCharacters.length);    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/png" });
    const imageUrl = URL.createObjectURL(blob);    

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = imageUrl;

      img.onload = () => {        
        const defaultWidth = 800;
        const defaultHeight = img.height * (defaultWidth / img.width);
        const scaleWidth = defaultWidth / img.width;
        const scaleHeight = defaultHeight / img.height;
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        // scale image x2
        ctx?.drawImage(img, 0, 0, defaultWidth, defaultHeight);
        if(showLabels) {
          for (let i = 0; i < contentItems.length; i++) {
            const item = contentItems[i];
            if (ctx) {
              ctx.strokeStyle = item.Color;
              ctx.lineWidth = defaultHeight / 500;
              ctx.fillStyle = item.Color;
              ctx.font = `bold ${defaultHeight / 70}px Arial`;
            }
            ctx?.beginPath();
            if (Array.isArray(item.Location)) {
              ctx?.moveTo(item.Location[0].X * scaleWidth, item.Location[0].Y * scaleHeight);
              ctx?.moveTo(item.Location[0].X * scaleWidth, item.Location[0].Y * scaleHeight);
              ctx?.lineTo(item.Location[1].X * scaleWidth, item.Location[1].Y * scaleHeight);
              ctx?.lineTo(item.Location[2].X * scaleWidth, item.Location[2].Y * scaleHeight);
              ctx?.lineTo(item.Location[3].X * scaleWidth, item.Location[3].Y * scaleHeight);
              ctx?.lineTo(item.Location[0].X * scaleWidth, item.Location[0].Y * scaleHeight);
              ctx?.fillText(item.Index.toString(), 
                item.Location[0].X * scaleWidth - (defaultWidth / 100), 
                item.Location[0].Y * scaleHeight - (defaultHeight / 300));
              ctx?.stroke(); 
            }
            else{
              ctx?.fillText(item.Index.toString(), 
                item.Location.X * scaleWidth - (defaultWidth / 100), 
                item.Location.Y * scaleHeight - (defaultHeight / 300));
              ctx?.stroke(); 
            }

          }
        }
      };
    }
  }, [base64file, contentItems, showLabels]);

  return <canvas 
      ref={canvasRef} 
      style={style} 
      width={800} 
      height={2000} 
      onClick={() => {setShowLabels(!showLabels)}}
    />;
};

export default RectangleCanvas;