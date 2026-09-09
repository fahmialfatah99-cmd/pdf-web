import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileDropZone from '../components/FileDropZone';
import { saveAs } from 'file-saver';

export default function MergePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    setFiles(prev => {
      const newFiles = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newFiles.length) return prev;
      [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
      return newFiles;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setProcessing(true);
    setProgress(0);

    try {
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        const fileBytes = await files[i].arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      saveAs(blob, 'merged-document.pdf');
    } catch (error) {
      console.error('Merge failed:', error);
      alert('Failed to merge PDFs. Please check the files.');
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Merge PDF Files</h2>
        <p className="text-slate-400">Combine multiple PDF documents into a single file. Drag to reorder.</p>
      </div>

      <FileDropZone
        onFilesSelected={handleFilesSelected}
        label="Drop PDF files here"
        description="Select multiple PDF files to merge"
        icon="📑"
      />

      {files.length > 0 && (
        <div className="mt-6 glass-card rounded-2xl p-6 glow-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Files to Merge ({files.length})</h3>
            <button
              onClick={() => setFiles([])}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/20 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-lg">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveFile(index, 'up')}
                    disabled={index === 0}
                    className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 flex items-center justify-center text-xs text-slate-300"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveFile(index, 'down')}
                    disabled={index === files.length - 1}
                    className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 flex items-center justify-center text-xs text-slate-300"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeFile(index)}
                    className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-xs text-red-400"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {processing && (
            <div className="mt-4">
              <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full progress-bar rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-sm text-slate-400 mt-2 text-center">Processing... {progress}%</p>
            </div>
          )}

          <button
            onClick={handleMerge}
            disabled={files.length < 2 || processing}
            className="mt-4 w-full btn-primary py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? '⏳ Merging...' : `📑 Merge ${files.length} Files`}
          </button>
        </div>
      )}
    </div>
  );
}
