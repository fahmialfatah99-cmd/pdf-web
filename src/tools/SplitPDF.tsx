import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileDropZone from '../components/FileDropZone';
import { saveAs } from 'file-saver';

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [splitMode, setSplitMode] = useState<'each' | 'range'>('each');
  const [rangeInput, setRangeInput] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    const pdfFile = files[0];
    if (!pdfFile) return;
    setFile(pdfFile);
    
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      setPageCount(pdf.getPageCount());
    } catch {
      alert('Failed to read PDF file');
    }
  };

  const parseRange = (range: string, max: number): number[][] => {
    const ranges: number[][] = [];
    const parts = range.split(',').map(s => s.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(s => parseInt(s.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          ranges.push([Math.max(1, start) - 1, Math.min(max, end) - 1]);
        }
      } else {
        const page = parseInt(part);
        if (!isNaN(page)) {
          ranges.push([page - 1, page - 1]);
        }
      }
    }
    return ranges;
  };

  const handleSplit = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const pdfBytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(pdfBytes);

      if (splitMode === 'each') {
        // Split each page into separate PDF
        for (let i = 0; i < sourcePdf.getPageCount(); i++) {
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(sourcePdf, [i]);
          newPdf.addPage(page);
          const bytes = await newPdf.save();
          const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
          saveAs(blob, `page-${i + 1}.pdf`);
        }
      } else {
        // Split by ranges
        const ranges = parseRange(rangeInput, sourcePdf.getPageCount());
        for (let r = 0; r < ranges.length; r++) {
          const [start, end] = ranges[r];
          const newPdf = await PDFDocument.create();
          const pageIndices = [];
          for (let i = start; i <= end; i++) {
            pageIndices.push(i);
          }
          const pages = await newPdf.copyPages(sourcePdf, pageIndices);
          pages.forEach(page => newPdf.addPage(page));
          const bytes = await newPdf.save();
          const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
          saveAs(blob, `split-${r + 1}_pages-${start + 1}-to-${end + 1}.pdf`);
        }
      }
    } catch (error) {
      console.error('Split failed:', error);
      alert('Failed to split PDF');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Split PDF</h2>
        <p className="text-slate-400">Split a PDF into individual pages or custom ranges.</p>
      </div>

      {!file ? (
        <FileDropZone
          onFilesSelected={handleFileSelected}
          multiple={false}
          label="Drop a PDF file here"
          description="Select a PDF to split"
          icon="✂️"
        />
      ) : (
        <div className="glass-card rounded-2xl p-6 glow-border">
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-2xl">📄</span>
            <div className="flex-1">
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-sm text-slate-400">{pageCount} pages • {(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={() => { setFile(null); setPageCount(0); }}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm"
            >
              Change
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Split Mode</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSplitMode('each')}
                  className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${splitMode === 'each' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                >
                  📄 Each Page Separately
                </button>
                <button
                  onClick={() => setSplitMode('range')}
                  className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${splitMode === 'range' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                >
                  📑 Custom Ranges
                </button>
              </div>
            </div>

            {splitMode === 'range' && (
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Page Ranges</label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="e.g., 1-3, 5, 7-10"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Use commas to separate ranges. Example: 1-3, 5, 7-10</p>
              </div>
            )}

            <button
              onClick={handleSplit}
              disabled={processing}
              className="w-full btn-primary py-3 rounded-xl text-white font-semibold disabled:opacity-50"
            >
              {processing ? '⏳ Splitting...' : '✂️ Split PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
