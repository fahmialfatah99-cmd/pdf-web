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
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Merge PDF Files</h2>
        <p className="text-[14px] text-zinc-400">Combine multiple PDF documents into a single file. Drag to reorder.</p>
      </div>

      <FileDropZone
        onFilesSelected={handleFilesSelected}
        label="Drop PDF files here"
        description="Select multiple PDF files to merge"
        icon="📑"
      />

      {files.length > 0 && (
        <div className="mt-6 glass-card rounded-2xl p-6 border border-white/[0.04] animate-scale-in">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-white">Files to Merge</h3>
                <p className="text-[11px] text-zinc-500">{files.length} files selected</p>
              </div>
            </div>
            <button
              onClick={() => setFiles([])}
              className="px-3 py-1.5 rounded-lg bg-red-500/[0.07] border border-red-500/10 text-red-400 text-[12px] font-medium hover:bg-red-500/[0.12] transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[12px] font-bold text-indigo-400">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">{file.name}</p>
                  <p className="text-[11px] text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => moveFile(index, 'up')}
                    disabled={index === 0}
                    className="w-7 h-7 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] disabled:opacity-20 flex items-center justify-center text-zinc-400 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveFile(index, 'down')}
                    disabled={index === files.length - 1}
                    className="w-7 h-7 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] disabled:opacity-20 flex items-center justify-center text-zinc-400 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeFile(index)}
                    className="w-7 h-7 rounded-lg bg-red-500/[0.07] hover:bg-red-500/[0.12] flex items-center justify-center text-red-400 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {processing && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-zinc-400">Processing...</span>
                <span className="text-[12px] font-medium text-indigo-400">{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                <div className="h-full progress-bar rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          <button
            onClick={handleMerge}
            disabled={files.length < 2 || processing}
            className="mt-5 w-full btn-primary py-3.5 rounded-xl text-white font-semibold text-[14px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{processing ? 'Merging Files...' : `Merge ${files.length} Files`}</span>
          </button>
        </div>
      )}
    </div>
  );
}
