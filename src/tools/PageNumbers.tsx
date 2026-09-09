import { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import FileDropZone from '../components/FileDropZone';
import { saveAs } from 'file-saver';

export default function PageNumbers() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [position, setPosition] = useState<'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left'>('bottom-center');
  const [fontSize, setFontSize] = useState(12);
  const [startFrom, setStartFrom] = useState(1);
  const [format, setFormat] = useState<'number' | 'of-total' | 'dash'>('number');
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

  const getPosition = (pageWidth: number, pageHeight: number) => {
    const margin = 40;
    switch (position) {
      case 'bottom-center': return { x: pageWidth / 2, y: margin, anchor: 'center' as const };
      case 'bottom-right': return { x: pageWidth - margin, y: margin, anchor: 'right' as const };
      case 'bottom-left': return { x: margin, y: margin, anchor: 'left' as const };
      case 'top-center': return { x: pageWidth / 2, y: pageHeight - margin, anchor: 'center' as const };
      case 'top-right': return { x: pageWidth - margin, y: pageHeight - margin, anchor: 'right' as const };
      case 'top-left': return { x: margin, y: pageHeight - margin, anchor: 'left' as const };
    }
  };

  const formatPageNumber = (num: number, total: number): string => {
    switch (format) {
      case 'number': return `${num}`;
      case 'of-total': return `${num} / ${total}`;
      case 'dash': return `- ${num} -`;
    }
  };

  const handleAddNumbers = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const pdfBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();

      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const pos = getPosition(width, height);
        const text = formatPageNumber(index + startFrom, pages.length + startFrom - 1);
        const textWidth = font.widthOfTextAtSize(text, fontSize);

        let x = pos.x;
        if (pos.anchor === 'center') x -= textWidth / 2;
        else if (pos.anchor === 'right') x -= textWidth;

        page.drawText(text, {
          x,
          y: pos.y,
          size: fontSize,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
      });

      const resultBytes = await pdf.save();
      const blob = new Blob([resultBytes as unknown as BlobPart], { type: 'application/pdf' });
      saveAs(blob, `numbered-${file.name}`);
    } catch (error) {
      console.error('Failed:', error);
      alert('Failed to add page numbers');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Add Page Numbers</h2>
        <p className="text-slate-400">Add page numbers to your PDF document.</p>
      </div>

      {!file ? (
        <FileDropZone
          onFilesSelected={handleFileSelected}
          multiple={false}
          label="Drop PDF file here"
          description="Select a PDF to add page numbers"
          icon="🔢"
        />
      ) : (
        <div className="glass-card rounded-2xl p-6 glow-border">
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-2xl">📄</span>
            <div className="flex-1">
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-sm text-slate-400">{pageCount} pages</p>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); }} className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm">Change</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'top-left', label: '↖ Top Left' },
                  { value: 'top-center', label: '↑ Top Center' },
                  { value: 'top-right', label: '↗ Top Right' },
                  { value: 'bottom-left', label: '↙ Bottom Left' },
                  { value: 'bottom-center', label: '↓ Bottom Center' },
                  { value: 'bottom-right', label: '↘ Bottom Right' },
                ] as const).map(pos => (
                  <button
                    key={pos.value}
                    onClick={() => setPosition(pos.value)}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${position === pos.value ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="number">1, 2, 3...</option>
                  <option value="of-total">1 / 10</option>
                  <option value="dash">- 1 -</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Start From</label>
                <input
                  type="number"
                  value={startFrom}
                  onChange={(e) => setStartFrom(Number(e.target.value))}
                  min={1}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Font Size: {fontSize}px</label>
              <input
                type="range"
                min="8"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <button
              onClick={handleAddNumbers}
              disabled={processing}
              className="w-full btn-primary py-3 rounded-xl text-white font-semibold disabled:opacity-50"
            >
              {processing ? '⏳ Adding Numbers...' : '🔢 Add Page Numbers'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
