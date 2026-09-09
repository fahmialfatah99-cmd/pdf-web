import { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import FileDropZone from '../components/FileDropZone';
import FileInfo from '../components/FileInfo';
import { saveAs } from 'file-saver';

export default function WatermarkPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(50);
  const [opacity, setOpacity] = useState(0.3);
  const [color, setColor] = useState('#ff0000');
  const [rotation, setRotation] = useState(-45);
  const [processing, setProcessing] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    const pdfFile = files[0];
    if (!pdfFile) return;
    setFile(pdfFile);
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      setPageCount(pdf.getPageCount());
    } catch { alert('Failed to read PDF'); }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16) / 255, g: parseInt(result[2], 16) / 255, b: parseInt(result[3], 16) / 255 } : { r: 1, g: 0, b: 0 };
  };

  const handleAddWatermark = async () => {
    if (!file || !watermarkText) return;
    setProcessing(true);
    try {
      const pdfBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const { r, g, b } = hexToRgb(color);
      for (const page of pdf.getPages()) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        page.drawText(watermarkText, {
          x: width / 2 - textWidth / 2, y: height / 2, size: fontSize, font,
          color: rgb(r, g, b), opacity, rotate: { type: 'degrees', angle: rotation } as any,
        });
      }
      const resultBytes = await pdf.save();
      const blob = new Blob([resultBytes as unknown as BlobPart], { type: 'application/pdf' });
      saveAs(blob, `watermarked-${file.name}`);
    } catch (error) {
      console.error('Watermark failed:', error);
      alert('Failed to add watermark');
    } finally { setProcessing(false); }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Add Watermark</h2>
        <p className="text-[14px] text-zinc-400">Add a text watermark to all pages of your PDF.</p>
      </div>

      {!file ? (
        <FileDropZone onFilesSelected={handleFileSelected} multiple={false} label="Drop PDF file here" description="Select a PDF to add watermark" icon="💧" />
      ) : (
        <div className="glass-card rounded-2xl p-6 border border-white/[0.04] animate-scale-in">
          <FileInfo fileName={file.name} pageCount={pageCount} onChange={() => { setFile(null); setPageCount(0); }} />

          <div className="space-y-5">
            <div>
              <label className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Watermark Text</label>
              <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} placeholder="Enter watermark text" className="w-full px-4 py-3 rounded-xl premium-input text-white text-[14px] placeholder-zinc-600 focus:outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Size: {fontSize}px</label>
                <input type="range" min="10" max="100" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Opacity: {Math.round(opacity * 100)}%</label>
                <input type="range" min="5" max="100" value={opacity * 100} onChange={(e) => setOpacity(Number(e.target.value) / 100)} className="w-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent" />
                  <span className="text-[13px] text-zinc-400 font-mono">{color}</span>
                </div>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Rotation: {rotation}°</label>
                <input type="range" min="-180" max="180" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-full" />
              </div>
            </div>

            {/* Preview */}
            <div className="p-8 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center min-h-[180px]">
              <p style={{ fontSize: `${Math.min(fontSize, 36)}px`, color: color, opacity: opacity, transform: `rotate(${rotation}deg)` }} className="font-bold select-none">
                {watermarkText || 'Watermark'}
              </p>
            </div>

            <button onClick={handleAddWatermark} disabled={processing || !watermarkText} className="w-full btn-primary py-3.5 rounded-xl text-white font-semibold text-[14px] disabled:opacity-40">
              <span>{processing ? 'Adding Watermark...' : 'Add Watermark'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
