import { useState, useRef } from 'react';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import FileDropZone from '../components/FileDropZone';
import { saveAs } from 'file-saver';

export default function SignPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signPage, setSignPage] = useState(1);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(10);
  const [signatureWidth, setSignatureWidth] = useState(200);
  const [signatureHeight, setSignatureHeight] = useState(80);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawMode, setDrawMode] = useState<'upload' | 'draw'>('draw');
  const [isDrawing, setIsDrawing] = useState(false);

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

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSignatureFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSignatureImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSignatureImage(canvas.toDataURL('image/png'));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureImage(null);
  };

  const handleSign = async () => {
    if (!file || !signatureImage) return;
    setProcessing(true);

    try {
      const pdfBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      
      // Convert signature to bytes
      const response = await fetch(signatureImage);
      const signatureBytes = await response.arrayBuffer();
      
      let signature;
      if (signatureFile && (signatureFile.type === 'image/png')) {
        signature = await pdf.embedPng(signatureBytes);
      } else {
        signature = await pdf.embedJpg(signatureBytes);
      }

      const page = pdf.getPage(signPage - 1);
      const { width, height } = page.getSize();

      const x = (positionX / 100) * width;
      const y = (positionY / 100) * height;

      page.drawImage(signature, {
        x,
        y,
        width: signatureWidth,
        height: signatureHeight,
      });

      const resultBytes = await pdf.save();
      const blob = new Blob([resultBytes as unknown as BlobPart], { type: 'application/pdf' });
      saveAs(blob, `signed-${file.name}`);
    } catch (error) {
      console.error('Signing failed:', error);
      alert('Failed to sign PDF. Try using PNG format for signature.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Sign PDF</h2>
        <p className="text-slate-400">Add your signature to a PDF document.</p>
      </div>

      {!file ? (
        <FileDropZone
          onFilesSelected={handleFileSelected}
          multiple={false}
          label="Drop PDF file here"
          description="Select a PDF to sign"
          icon="✍️"
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
            {/* Signature Mode */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Signature Method</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setDrawMode('draw')}
                  className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${drawMode === 'draw' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
                >
                  ✏️ Draw Signature
                </button>
                <button
                  onClick={() => setDrawMode('upload')}
                  className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${drawMode === 'upload' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
                >
                  📁 Upload Image
                </button>
              </div>
            </div>

            {drawMode === 'draw' ? (
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Draw Your Signature</label>
                <div className="bg-white rounded-xl p-2 mb-2">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={150}
                    className="w-full cursor-crosshair rounded-lg border border-slate-300"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
                <button onClick={clearCanvas} className="text-sm text-slate-400 hover:text-white">Clear Canvas</button>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Upload Signature Image</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleSignatureUpload}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm"
                />
              </div>
            )}

            {signatureImage && (
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-2">Signature Preview:</p>
                <img src={signatureImage} alt="Signature" className="max-h-20 rounded" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Page Number</label>
                <input
                  type="number"
                  value={signPage}
                  onChange={(e) => setSignPage(Number(e.target.value))}
                  min={1}
                  max={pageCount}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Width: {signatureWidth}px</label>
                <input
                  type="range"
                  min="50"
                  max="400"
                  value={signatureWidth}
                  onChange={(e) => setSignatureWidth(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">X Position: {positionX}%</label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={positionX}
                  onChange={(e) => setPositionX(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Y Position: {positionY}%</label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={positionY}
                  onChange={(e) => setPositionY(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={handleSign}
              disabled={processing || !signatureImage}
              className="w-full btn-primary py-3 rounded-xl text-white font-semibold disabled:opacity-50"
            >
              {processing ? '⏳ Signing...' : '✍️ Sign PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
