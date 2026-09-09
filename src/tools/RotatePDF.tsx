import { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import FileDropZone from '../components/FileDropZone';
import FileInfo from '../components/FileInfo';
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
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Rotate PDF Pages</h2>
        <p className="text-[14px] text-zinc-400">Rotate all or specific pages of your PDF document.</p>
      </div>

      {!file ? (
        <FileDropZone onFilesSelected={handleFileSelected} multiple={false} label="Drop PDF file here" description="Select a PDF to rotate pages" icon="🔄" />
      ) : (
        <div className="glass-card rounded-2xl p-6 border border-white/[0.04] animate-scale-in">
          <FileInfo fileName={file.name} pageCount={pageCount} onChange={() => { setFile(null); setPageCount(0); }} />

          <div className="space-y-5">
            <div>
              <label className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-3 block">Rotation Angle</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { angle: 90, label: '90°', icon: '↻' },
                  { angle: 180, label: '180°', icon: '↓' },
                  { angle: 270, label: '270°', icon: '↺' },
                ].map(item => (
                  <button
                    key={item.angle}
                    onClick={() => setRotation(item.angle)}
                    className={`p-4 rounded-xl border text-center transition-all ${rotation === item.angle ? 'bg-indigo-500/[0.07] border-indigo-500/20 text-white' : 'bg-white/[0.02] border-white/[0.04] text-zinc-400 hover:border-white/[0.08]'}`}
                  >
                    <div className="text-[20px] mb-1">{item.icon}</div>
                    <p className="text-[13px] font-semibold">{item.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-3 block">Apply To</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'all', label: 'All Pages', icon: '📄' },
                  { value: 'even', label: 'Even Pages', icon: '📑' },
                  { value: 'odd', label: 'Odd Pages', icon: '📃' },
                  { value: 'custom', label: 'Custom Pages', icon: '🎯' },
                ] as const).map(option => (
                  <button
                    key={option.value}
                    onClick={() => setApplyTo(option.value)}
                    className={`p-3 rounded-xl border text-[13px] font-medium transition-all ${applyTo === option.value ? 'bg-indigo-500/[0.07] border-indigo-500/20 text-white' : 'bg-white/[0.02] border-white/[0.04] text-zinc-400 hover:border-white/[0.08]'}`}
                  >
                    {option.icon} {option.label}
                  </button>
                ))}
              </div>
            </div>

            {applyTo === 'custom' && (
              <div className="animate-fade-in-up">
                <input
                  type="text"
                  value={customPages}
                  onChange={(e) => setCustomPages(e.target.value)}
                  placeholder="e.g., 1, 3, 5-7"
                  className="w-full px-4 py-3 rounded-xl premium-input text-white text-[14px] placeholder-zinc-600 focus:outline-none"
                />
              </div>
            )}

            <button
              onClick={handleRotate}
              disabled={processing}
              className="w-full btn-primary py-3.5 rounded-xl text-white font-semibold text-[14px] disabled:opacity-40"
            >
              <span>{processing ? 'Rotating...' : `Rotate ${rotation}°`}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
