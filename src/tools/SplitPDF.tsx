import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileDropZone from '../components/FileDropZone';
import FileInfo from '../components/FileInfo';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

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
        if (!isNaN(page)) ranges.push([page - 1, page - 1]);
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
      const zip = new JSZip();
      
      if (splitMode === 'each') {
        for (let i = 0; i < sourcePdf.getPageCount(); i++) {
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(sourcePdf, [i]);
          newPdf.addPage(page);
          const bytes = await newPdf.save();
          zip.file(`page-${i + 1}.pdf`, bytes as unknown as BlobPart);
        }
      } else {
        const ranges = parseRange(rangeInput, sourcePdf.getPageCount());
        for (let r = 0; r < ranges.length; r++) {
          const [start, end] = ranges[r];
          const newPdf = await PDFDocument.create();
          const pageIndices = [];
          for (let i = start; i <= end; i++) pageIndices.push(i);
          const pages = await newPdf.copyPages(sourcePdf, pageIndices);
          pages.forEach(page => newPdf.addPage(page));
          const bytes = await newPdf.save();
          zip.file(`split-${r + 1}_pages-${start + 1}-to-${end + 1}.pdf`, bytes as unknown as BlobPart);
        }
      }
      
      // Generate and download ZIP file
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${file.name.replace('.pdf', '')}-split.zip`);
    } catch (error) {
      console.error('Split failed:', error);
      alert('Failed to split PDF');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Split PDF</h2>
        <p className="text-[14px] text-zinc-400">Split a PDF into individual pages or custom ranges.</p>
      </div>

      {!file ? (
        <FileDropZone onFilesSelected={handleFileSelected} multiple={false} label="Drop a PDF file here" description="Select a PDF to split" icon="✂️" />
      ) : (
        <div className="glass-card rounded-2xl p-6 border border-white/[0.04] animate-scale-in">
          <FileInfo fileName={file.name} pageCount={pageCount} fileSize={file.size} onChange={() => { setFile(null); setPageCount(0); }} />

          <div className="space-y-5">
            <div>
              <label className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-3 block">Split Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSplitMode('each')}
                  className={`p-4 rounded-xl border text-left transition-all ${splitMode === 'each' ? 'bg-indigo-500/[0.07] border-indigo-500/20 text-white' : 'bg-white/[0.02] border-white/[0.04] text-zinc-400 hover:border-white/[0.08]'}`}
                >
                  <div className="text-lg mb-1">📄</div>
                  <p className="text-[13px] font-semibold">Each Page</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Split into separate files</p>
                </button>
                <button
                  onClick={() => setSplitMode('range')}
                  className={`p-4 rounded-xl border text-left transition-all ${splitMode === 'range' ? 'bg-indigo-500/[0.07] border-indigo-500/20 text-white' : 'bg-white/[0.02] border-white/[0.04] text-zinc-400 hover:border-white/[0.08]'}`}
                >
                  <div className="text-lg mb-1">📑</div>
                  <p className="text-[13px] font-semibold">Custom Ranges</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Define page ranges</p>
                </button>
              </div>
            </div>

            {splitMode === 'range' && (
              <div className="animate-fade-in-up">
                <label className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Page Ranges</label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="e.g., 1-3, 5, 7-10"
                  className="w-full px-4 py-3 rounded-xl premium-input text-white text-[14px] placeholder-zinc-600 focus:outline-none"
                />
                <p className="text-[11px] text-zinc-600 mt-1.5">Use commas to separate ranges</p>
              </div>
            )}

            <button
              onClick={handleSplit}
              disabled={processing}
              className="w-full btn-primary py-3.5 rounded-xl text-white font-semibold text-[14px] disabled:opacity-40"
            >
              <span>{processing ? 'Splitting...' : 'Split PDF'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
