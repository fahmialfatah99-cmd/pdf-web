import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileDropZone from '../components/FileDropZone';
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
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Extract Pages</h2>
        <p className="text-slate-400">Select and extract specific pages from your PDF.</p>
      </div>

      {!file ? (
        <FileDropZone
          onFilesSelected={handleFileSelected}
          multiple={false}
          label="Drop PDF file here"
          description="Select a PDF to extract pages from"
          icon="📄"
        />
      ) : (
        <div className="glass-card rounded-2xl p-6 glow-border">
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-2xl">📄</span>
            <div className="flex-1">
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-sm text-slate-400">{pageCount} pages • {selectedPages.size} selected</p>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); setSelectedPages(new Set()); }} className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm">Change</button>
          </div>

          <div className="flex gap-3 mb-4">
            <button onClick={selectAll} className="px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm hover:bg-indigo-500/20">Select All</button>
            <button onClick={selectNone} className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-300 text-sm hover:bg-slate-600">Deselect All</button>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-64 overflow-y-auto mb-6">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                onClick={() => togglePage(i)}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                  selectedPages.has(i)
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-indigo-500/50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={handleExtract}
            disabled={processing || selectedPages.size === 0}
            className="w-full btn-primary py-3 rounded-xl text-white font-semibold disabled:opacity-50"
          >
            {processing ? '⏳ Extracting...' : `📄 Extract ${selectedPages.size} Page${selectedPages.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
}
