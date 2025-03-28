import { IconButton, Tooltip } from '@mui/material';
import React, { useState, useRef, useEffect } from 'react';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export const bytesToSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return 'n/a';
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
}

export class UploadFile {
  public name: string = '';
  public size: number = 0;
  public base64data: string = '';

  async initialize(file: File): Promise<void> {
    this.name = file.name;
    this.size = file.size;
    this.base64data = await this.toBase64(file);
  }

  private toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}

interface FileUploadIconProps {
  onFilesAdded: (files: FileList) => void;
  uploadFiles: UploadFile[];
  visible?: boolean;
  tooltipText?: string;
}

export const FileUploadIcon: React.FC<FileUploadIconProps> = ({ onFilesAdded, uploadFiles, visible = true, tooltipText = "Attach files" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (uploadFiles.length === 0) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [uploadFiles]);

  const handleFiles = (files: FileList) => {
    onFilesAdded(files);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(event.target.files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files) {
      handleFiles(event.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`file-upload-icon ${isDragging ? 'dragging' : ''}`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />
        <Tooltip title={tooltipText}>
          <IconButton
            sx={{ width: 40, alignSelf: 'center' }}
          >
            { visible ? <UploadFileIcon /> : <></> } 
          </IconButton>
        </Tooltip>
    </div>
  );
};
