import React, { useRef } from 'react';
import { Upload, X, ImagePlus } from 'lucide-react';
import { cn } from '../../utils/idGenerator';

interface FileUploadZoneProps {
  onUpload: (files: File[]) => void;
  compact?: boolean;
  className?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onUpload, compact = false, className }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const arr = Array.from(list).filter((f) => f.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...arr]);
  };

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const confirmUpload = () => {
    if (files.length > 0) {
      onUpload(files);
      setFiles([]);
    }
  };

  if (compact) {
    return (
      <div className={className}>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            if (e.target.files) onUpload(Array.from(e.target.files).filter((f) => f.type.startsWith('image/')));
            e.target.value = '';
          }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="btn-secondary flex items-center gap-2"
        >
          <ImagePlus className="w-4 h-4" />
          上传分镜
        </button>
      </div>
    );
  }

  return (
    <div className={cn('panel p-4', className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all',
          dragOver
            ? 'border-accent-400 bg-accent-400/5 animate-breathe'
            : 'border-ink-600/60 hover:border-ink-500 bg-ink-900/30',
        )}
      >
        <Upload className="w-10 h-10 text-ink-300 mb-3" />
        <div className="text-ink-100 font-medium mb-1">拖拽图片到此区域上传</div>
        <div className="text-sm text-ink-300">或点击选择文件（支持批量上传 JPG / PNG / WEBP）</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="text-sm text-ink-200 flex items-center justify-between">
            <span>待上传 <span className="font-mono text-accent-400">{files.length}</span> 张图片</span>
            <div className="flex gap-2">
              <button className="btn-ghost text-sm" onClick={() => setFiles([])}>
                清空
              </button>
              <button className="btn-primary text-sm" onClick={confirmUpload}>
                确认上传
              </button>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {files.slice(0, 10).map((f, i) => (
              <div
                key={i + f.name + f.size}
                className="relative aspect-[3/4] rounded border border-ink-600/50 overflow-hidden bg-ink-700/50"
              >
                <img
                  src={URL.createObjectURL(f)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-ink-950/70 text-ink-50 flex items-center justify-center hover:bg-danger"
                >
                  <X className="w-3 h-3" />
                </button>
                {i === 9 && files.length > 10 && (
                  <div className="absolute inset-0 bg-ink-950/70 flex items-center justify-center text-ink-50 text-sm">
                    +{files.length - 10}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
