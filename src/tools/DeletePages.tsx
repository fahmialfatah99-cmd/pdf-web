import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileDropZone from '../components/FileDropZone';
import FileInfo from '../components/FileInfo';
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
    } catch { alert('Failed to read PDF'); }
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
    if (selectedPages.size === pageCount) { alert('Cannot delete all pages!'); return; }
    setProcessing(true);
    try {
      const pdfBytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();
      const pagesToKeep: number[] = [];
      for (let i = 0; i < pageCount; i++) {
        if (!selectedPages.has(i)) pagesToKeep.push(i);
      }
      const pages = await newPdf.copyPages(sourcePdf, pagesToKeep);
      pages.forEach(page => newPdf.addPage(page));
      const resultBytes = await newPdf.save();
      const blob = new Blob([resultBytes as unknown as BlobPart], { type: 'application/pdf' });
      saveAs(blob, `pages-removed-${file.name}`);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete pages');
    } finally { setProcessing(false); }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Delete Pages</h2>
        <p className="text-[14px] text-zinc-400">Remove unwanted pages from your PDF document.</p>
      </div>

      {!file ? (
        <FileDropZone onFilesSelected={handleFileSelected} multiple={false} label="Drop PDF file here" description="Select a PDF to remove pages from" icon="🗑️" />
      ) : (
        <div className="glass-card rounded-2xl p-6 border border-white/[0.04] animate-scale-in">
          <FileInfo fileName={file.name} pageCount={pageCount} onChange={() => { setFile(null); setPageCount(0); setSelectedPages(new Set()); }} extra={<><span className="text-zinc-700">•</span><span className="text-red-400 font-semibold">{selectedPages.size} marked</span></>} />

          <div className="p-4 rounded-xl bg-red-500/[0.05] border border-red-500/10 mb-5">
            <p className="text-[12px] text-red-300/80">⚠️ Select pages you want to <strong>remove</strong>. Click a page to toggle selection.</p>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-64 overflow-y-auto mb-6">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                onClick={() => togglePage(i)}
                className={`aspect-square rounded-lg flex items-center justify-center text-[12px] font-semibold transition-all ${
                  selectedPages.has(i)
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 line-through'
                    : 'bg-white/[0.02] text-zinc-500 border border-white/[0.04] hover:border-red-500/20 hover:text-zinc-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
              <p className="text-2xl font-bold text-green-400">{pageCount - selectedPages.size}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Pages to Keep</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
              <p className="text-2xl font-bold text-red-400">{selectedPages.size}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Pages to Delete</p>
            </div>
          </div>

          <button
            onClick={handleDelete}
            disabled={processing || selectedPages.size === 0 || selectedPages.size === pageCount}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-[14px] disabled:opacity-40 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-500/20"
          >
            {processing ? 'Deleting...' : `Delete ${selectedPages.size} Page${selectedPages.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
}
