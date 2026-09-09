import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileDropZone from '../components/FileDropZone';
import FileInfo from '../components/FileInfo';
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
      pdf.setTitle('');
      pdf.setAuthor('');
      pdf.setSubject('');
      pdf.setKeywords([]);
      pdf.setProducer('');
      pdf.setCreator('');
      const compressedBytes = await pdf.save({ useObjectStreams: true, addDefaultPage: false, objectsPerTick: 100 });
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
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Compress PDF</h2>
        <p className="text-[14px] text-zinc-400">Reduce your PDF file size by optimizing the document structure.</p>
      </div>

      {!file ? (
        <FileDropZone onFilesSelected={handleFileSelected} multiple={false} label="Drop PDF file here" description="Select a PDF to compress" icon="📦" />
      ) : (
        <div className="glass-card rounded-2xl p-6 border border-white/[0.04] animate-scale-in">
          <FileInfo fileName={file.name} fileSize={originalSize} onChange={() => { setFile(null); setDone(false); }} />

          {done && (
            <div className="mb-6 p-5 rounded-xl bg-green-500/[0.05] border border-green-500/10 animate-scale-in">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <p className="text-[13px] font-semibold text-green-400">Compression Complete!</p>
                  </div>
                  <p className="text-[12px] text-zinc-500">
                    {(originalSize / 1024).toFixed(1)} KB → {(compressedSize / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-400">{getReduction()}%</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">reduced</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleCompress}
            disabled={processing}
            className="w-full btn-primary py-3.5 rounded-xl text-white font-semibold text-[14px] disabled:opacity-40"
          >
            <span>{processing ? 'Compressing...' : 'Compress PDF'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
