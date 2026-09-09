import { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import FileDropZone from '../components/FileDropZone';
import { saveAs } from 'file-saver';

export default function RotatePDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotation, setRotation] = useState(90);
  const [applyTo, setApplyTo] = useState<'all' | 'even' | 'odd' | 'custom'>('all');
  const [customPages, setCustomPages] = useState('');
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
      alert('Failed to read PDF');
    }
  };

  const getPagesToRotate = (): number[] => {
    const pages: number[] = [];
    switch (applyTo) {
      case 'all':
        for (let i = 0; i < pageCount; i++) pages.push(i);
        break;
      case 'even':
        for (let i = 1; i < pageCount; i += 2) pages.push(i);
        break;
      case 'odd':
        for (let i = 0; i < pageCount; i += 2) pages.push(i);
        break;
      case 'custom':
        customPages.split(',').forEach(p => {
          const page = parseInt(p.trim()) - 1;
          if (page >= 0 && page < pageCount) pages.push(page);
        });
        break;
    }
    return pages;
  };

  const handleRotate = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const pdfBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = getPagesToRotate();

      pages.forEach(pageIndex => {
        const page = pdf.getPage(pageIndex);
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotation));
      });

      const resultBytes = await pdf.save();
      const blob = new Blob([resultBytes as unknown as BlobPart], { type: 'application/pdf' });
      saveAs(blob, `rotated-${file.name}`);
    } catch (error) {
      console.error('Rotation failed:', error);
      alert('Failed to rotate PDF');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Rotate PDF Pages</h2>
        <p className="text-slate-400">Rotate all or specific pages of your PDF document.</p>
      </div>

      {!file ? (
        <FileDropZone
          onFilesSelected={handleFileSelected}
          multiple={false}
          label="Drop PDF file here"
          description="Select a PDF to rotate pages"
          icon="🔄"
        />
      ) : (
        <div className="glass-card rounded-2xl p-6 glow-border">
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-2xl">📄</span>
            <div className="flex-1">
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-sm text-slate-400">{pageCount} pages</p>
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
              <label className="text-sm font-medium text-slate-300 mb-2 block">Rotation Angle</label>
              <div className="flex gap-3">
                {[90, 180, 270].map(angle => (
                  <button
                    key={angle}
                    onClick={() => setRotation(angle)}
                    className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${rotation === angle ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
                  >
                    {angle}° {angle === 90 ? '→' : angle === 180 ? '↓' : '←'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Apply To</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'all', label: '📄 All Pages' },
                  { value: 'even', label: '📑 Even Pages' },
                  { value: 'odd', label: '📃 Odd Pages' },
                  { value: 'custom', label: '🎯 Custom Pages' },
                ] as const).map(option => (
                  <button
                    key={option.value}
                    onClick={() => setApplyTo(option.value)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${applyTo === option.value ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {applyTo === 'custom' && (
              <div>
                <input
                  type="text"
                  value={customPages}
                  onChange={(e) => setCustomPages(e.target.value)}
                  placeholder="e.g., 1, 3, 5-7"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}

            <button
              onClick={handleRotate}
              disabled={processing}
              className="w-full btn-primary py-3 rounded-xl text-white font-semibold disabled:opacity-50"
            >
              {processing ? '⏳ Rotating...' : `🔄 Rotate ${rotation}°`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
