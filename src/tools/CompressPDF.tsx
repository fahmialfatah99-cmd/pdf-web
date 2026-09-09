import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileDropZone from '../components/FileDropZone';
import { saveAs } from 'file-saver';

export default function CompressPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    const pdfFile = files[0];
    if (!pdfFile) return;
    setFile(pdfFile);
    setOriginalSize(pdfFile.size);
    setDone(false);
  };

  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const pdfBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      
      // Remove metadata to reduce size
      pdf.setTitle('');
      pdf.setAuthor('');
      pdf.setSubject('');
      pdf.setKeywords([]);
      pdf.setProducer('');
      pdf.setCreator('');

      const compressedBytes = await pdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 100,
      });

      setCompressedSize(compressedBytes.length);
      setDone(true);

      const blob = new Blob([compressedBytes as unknown as BlobPart], { type: 'application/pdf' });
      saveAs(blob, `compressed-${file.name}`);
    } catch (error) {
      console.error('Compression failed:', error);
      alert('Failed to compress PDF');
    } finally {
      setProcessing(false);
    }
  };

  const getReduction = () => {
    if (!originalSize || !compressedSize) return 0;
    return Math.round((1 - compressedSize / originalSize) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Compress PDF</h2>
        <p className="text-slate-400">Reduce your PDF file size by optimizing the document structure.</p>
      </div>

      {!file ? (
        <FileDropZone
          onFilesSelected={handleFileSelected}
          multiple={false}
          label="Drop PDF file here"
          description="Select a PDF to compress"
          icon="📦"
        />
      ) : (
        <div className="glass-card rounded-2xl p-6 glow-border">
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-2xl">📄</span>
            <div className="flex-1">
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-sm text-slate-400">{(originalSize / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={() => { setFile(null); setDone(false); }}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm"
            >
              Change
            </button>
          </div>

          {done && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 font-semibold">✅ Compression Complete!</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {(originalSize / 1024).toFixed(1)} KB → {(compressedSize / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">{getReduction()}%</p>
                  <p className="text-xs text-slate-400">reduced</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleCompress}
            disabled={processing}
            className="w-full btn-primary py-3 rounded-xl text-white font-semibold disabled:opacity-50"
          >
            {processing ? '⏳ Compressing...' : '📦 Compress PDF'}
          </button>
        </div>
      )}
    </div>
  );
}
