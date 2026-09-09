import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileDropZone from '../components/FileDropZone';
import FileInfo from '../components/FileInfo';
import { saveAs } from 'file-saver';

export default function ExtractPages() {
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

  const selectAll = () => {
    const all = new Set<number>();
    for (let i = 0; i < pageCount; i++) all.add(i);
    setSelectedPages(all);
  };

  const selectNone = () => setSelectedPages(new Set());

  const handleExtract = async () => {
    if (!file || selectedPages.size === 0) return;
    setProcessing(true);
    try {
      const pdfBytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();
      const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
      const pages = await newPdf.copyPages(sourcePdf, sortedPages);
      pages.forEach(page => newPdf.addPage(page));
      const resultBytes = await newPdf.save();
      const blob = new Blob([resultBytes as unknown as BlobPart], { type: 'application/pdf' });
      saveAs(blob, `extracted-${file.name}`);
    } catch (error) {
      console.error('Extraction failed:', error);
      alert('Failed to extract pages');
    } finally { setProcessing(false); }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Extract Pages</h2>
        <p className="text-[14px] text-zinc-400">Select and extract specific pages from your PDF.</p>
      </div>

      {!file ? (
        <FileDropZone onFilesSelected={handleFileSelected} multiple={false} label="Drop PDF file here" description="Select a PDF to extract pages from" icon="📄" />
      ) : (
        <div className="glass-card rounded-2xl p-6 border border-white/[0.04] animate-scale-in">
          <FileInfo fileName={file.name} pageCount={pageCount} onChange={() => { setFile(null); setPageCount(0); setSelectedPages(new Set()); }} extra={<><span className="text-zinc-700">•</span><span className="text-indigo-400 font-semibold">{selectedPages.size} selected</span></>} />

          <div className="flex gap-2 mb-4">
            <button onClick={selectAll} className="px-4 py-2 rounded-lg bg-indigo-500/[0.07] border border-indigo-500/10 text-indigo-300 text-[12px] font-medium hover:bg-indigo-500/[0.12] transition-colors">Select All</button>
            <button onClick={selectNone} className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-zinc-400 text-[12px] font-medium hover:bg-white/[0.06] transition-colors">Deselect All</button>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-64 overflow-y-auto mb-6">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                onClick={() => togglePage(i)}
                className={`aspect-square rounded-lg flex items-center justify-center text-[12px] font-semibold transition-all ${
                  selectedPages.has(i)
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-white/[0.02] text-zinc-500 border border-white/[0.04] hover:border-indigo-500/20 hover:text-zinc-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={handleExtract}
            disabled={processing || selectedPages.size === 0}
            className="w-full btn-primary py-3.5 rounded-xl text-white font-semibold text-[14px] disabled:opacity-40"
          >
            <span>{processing ? 'Extracting...' : `Extract ${selectedPages.size} Page${selectedPages.size !== 1 ? 's' : ''}`}</span>
          </button>
        </div>
      )}
    </div>
  );
}
