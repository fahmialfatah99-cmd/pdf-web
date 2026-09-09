import { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import FileDropZone from '../components/FileDropZone';
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
    } catch {
      alert('Failed to read PDF');
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    } : { r: 1, g: 0, b: 0 };
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
          x: width / 2 - textWidth / 2,
          y: height / 2,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity,
          rotate: { type: 'degrees', angle: rotation } as any,
        });
      }

      const resultBytes = await pdf.save();
      const blob = new Blob([resultBytes as unknown as BlobPart], { type: 'application/pdf' });
      saveAs(blob, `watermarked-${file.name}`);
    } catch (error) {
      console.error('Watermark failed:', error);
      alert('Failed to add watermark');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Add Watermark</h2>
        <p className="text-slate-400">Add a text watermark to all pages of your PDF.</p>
      </div>

      {!file ? (
        <FileDropZone
          onFilesSelected={handleFileSelected}
          multiple={false}
          label="Drop PDF file here"
          description="Select a PDF to add watermark"
          icon="💧"
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
              <label className="text-sm font-medium text-slate-300 mb-2 block">Watermark Text</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Enter watermark text"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Font Size: {fontSize}px</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Opacity: {Math.round(opacity * 100)}%</label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={opacity * 100}
                  onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                  />
                  <span className="text-sm text-slate-400">{color}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Rotation: {rotation}°</label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center min-h-[200px]">
              <p
                style={{
                  fontSize: `${Math.min(fontSize, 40)}px`,
                  color: color,
                  opacity: opacity,
                  transform: `rotate(${rotation}deg)`,
                }}
                className="font-bold select-none"
              >
                {watermarkText || 'Watermark'}
              </p>
            </div>

            <button
              onClick={handleAddWatermark}
              disabled={processing || !watermarkText}
              className="w-full btn-primary py-3 rounded-xl text-white font-semibold disabled:opacity-50"
            >
              {processing ? '⏳ Adding Watermark...' : '💧 Add Watermark'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
