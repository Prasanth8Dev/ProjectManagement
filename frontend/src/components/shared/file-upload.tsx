'use client';
import { useCallback, useRef, useState } from 'react';
import { Upload, X, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  maxSize?: number; // bytes, default 10MB
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onUpload,
  accept,
  maxSize = 10 * 1024 * 1024,
  multiple = true,
  disabled = false,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const newFiles: File[] = [];
      const newErrors: string[] = [];

      Array.from(fileList).forEach((file) => {
        if (file.size > maxSize) {
          newErrors.push(`${file.name} exceeds the ${formatFileSize(maxSize)} limit.`);
          return;
        }
        newFiles.push(file);
      });

      setErrors(newErrors);
      if (newFiles.length > 0) {
        const updated = multiple ? [...selectedFiles, ...newFiles] : newFiles;
        setSelectedFiles(updated);
        onUpload(newFiles);
      }
    },
    [maxSize, multiple, onUpload, selectedFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      processFiles(e.dataTransfer.files);
    },
    [disabled, processFiles]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-foreground">
          Drop files here or{' '}
          <span className="text-primary underline">click to browse</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {accept ? `Accepted: ${accept} · ` : ''}Max {formatFileSize(maxSize)} per file
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => processFiles(e.target.files)}
          // Reset value so same file can be re-selected
          onClick={(e) => ((e.target as HTMLInputElement).value = '')}
        />
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-destructive">
              {err}
            </p>
          ))}
        </div>
      )}

      {/* File list */}
      {selectedFiles.length > 0 && (
        <ul className="space-y-1.5">
          {selectedFiles.map((file, idx) => (
            <li
              key={`${file.name}-${idx}`}
              className="flex items-center gap-2.5 p-2.5 rounded-md border bg-muted/50"
            >
              <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
