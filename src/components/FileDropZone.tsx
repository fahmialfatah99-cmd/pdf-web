import { useState, useRef, useCallback } from 'react';

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  description?: string;
  icon?: string;
}

export default function FileDropZone({ onFilesSelected, accept = '.pdf', multiple = true, label = 'Drop files here', description = 'or click to browse', icon = '📄' }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onFilesSelected(files);
  }, [onFilesSelected]);

  const handleClick = () => fileInputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onFilesSelected(files);
  };

  return (
    <div
      className={`drop-zone rounded-2xl p-10 sm:p-14 text-center cursor-pointer relative ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      
      <div className="relative">
        {/* Icon with glow */}
        <div className="relative inline-block mb-5">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl"></div>
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center">
            <span className="text-3xl animate-float">{icon}</span>
          </div>
        </div>
        
        <p className="text-lg font-semibold text-white mb-1.5">{label}</p>
        <p className="text-[13px] text-zinc-500 mb-5">{description}</p>
        
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-300 text-[13px] font-medium hover:bg-white/[0.05] hover:border-indigo-500/20 transition-all">
          <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Browse Files
        </div>
      </div>
    </div>
  );
}
