import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileDropZone from '../components/FileDropZone';
import { saveAs } from 'file-saver';

export default function DeletePages() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    const pdfFile = files[0];
    if (!pdfFile) return;
    setFile(pdfFile);
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      setPageCount(pdf.getPageCount());
      setSelectedPages(new Set());
    } catch {
      alert('Failed to read PDF');
    }
  };

  const togglePage = (page: number) => {
    setSelectedPages(prev => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!file || selectedPages.size === 0) return;
    if (selectedPages.size === pageCount) {
      alert('Cannot delete all pages!');
      return;
    }
    setProcessing(true);

    try {
      const pdfBytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();

      // Copy pages that are NOT selected for deletion
      const pagesToKeep: number[] = [];
      for (let i = 0; i < pageCount; i++) {
        if (!selectedPages.has(i)) {
          pagesToKeep.push(i);
        }
      }

      const pages = await newPdf.copyPages(sourcePdf, pagesToKeep);
      pages.forEach(page => newPdf.addPage(page));

      const resultBytes = await newPdf.save();
      const blob = new Blob([resultBytes as unknown as BlobPart], { type: 'application/pdf' });
      saveAs(blob, `pages-removed-${file.name}`);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete pages');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Delete Pages</h2>
        <p className="text-slate-400">Remove unwanted pages from your PDF document.</p>
      </div>

      {!file ? (
        <FileDropZone
          onFilesSelected={handleFileSelected}
          multiple={false}
          label="Drop PDF file here"
          description="Select a PDF to remove pages from"
          icon="🗑️"
        />
      ) : (
        <div className="glass-card rounded-2xl p-6 glow-border">
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-2xl">📄</span>
            <div className="flex-1">
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-sm text-slate-400">{pageCount} pages • {selectedPages.size} marked for deletion</p>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); setSelectedPages(new Set()); }} className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm">Change</button>
          </div>

          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
            <p className="text-sm text-red-300">⚠️ Select pages you want to <strong>remove</strong>. Click a page to toggle selection. Selected pages will be deleted from the final PDF.</p>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-64 overflow-y-auto mb-6">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                onClick={() => togglePage(i)}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                  selectedPages.has(i)
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 line-through'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-red-500/50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="flex gap-3 mb-4">
            <div className="flex-1 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
              <p className="text-2xl font-bold text-green-400">{pageCount - selectedPages.size}</p>
              <p className="text-xs text-slate-400">Pages to Keep</p>
            </div>
            <div className="flex-1 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
              <p className="text-2xl font-bold text-red-400">{selectedPages.size}</p>
              <p className="text-xs text-slate-400">Pages to Delete</p>
            </div>
          </div>

          <button
            onClick={handleDelete}
            disabled={processing || selectedPages.size === 0 || selectedPages.size === pageCount}
            className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-500/30"
          >
            {processing ? '⏳ Deleting...' : `🗑️ Delete ${selectedPages.size} Page${selectedPages.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
}
