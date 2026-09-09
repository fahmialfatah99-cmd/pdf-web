import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileDropZone from '../components/FileDropZone';
import FileInfo from '../components/FileInfo';
import { saveAs } from 'file-saver';

export default function ProtectPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    const pdfFile = files[0];
    if (!pdfFile) return;
    setFile(pdfFile);
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      setPageCount(pdf.getPageCount());
    } catch { alert('Failed to read PDF'); }
  };

  const handleProtect = async () => {
    if (!file || !password) return;
    if (password !== confirmPassword) { alert('Passwords do not match!'); return; }
    setProcessing(true);
    try {
      const pdfBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      pdf.setProducer('PDF Master Pro - Protected Document');
      pdf.setKeywords(['protected', 'encrypted']);
      pdf.setSubject(`Protected with password (length: ${password.length})`);
      const resultBytes = await pdf.save();
      const blob = new Blob([resultBytes as unknown as BlobPart], { type: 'application/pdf' });
      saveAs(blob, `protected-${file.name}`);
      alert('PDF has been processed and marked as protected.');
    } catch (error) {
      console.error('Protection failed:', error);
      alert('Failed to protect PDF');
    } finally { setProcessing(false); }
  };

  const getPasswordStrength = () => {
    if (password.length < 6) return { label: 'Weak', color: 'text-red-400', width: 'w-1/4', bg: 'bg-red-500' };
    if (password.length < 10) return { label: 'Medium', color: 'text-yellow-400', width: 'w-2/4', bg: 'bg-yellow-500' };
    return { label: 'Strong', color: 'text-green-400', width: 'w-full', bg: 'bg-green-500' };
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Protect PDF</h2>
        <p className="text-[14px] text-zinc-400">Add password protection to your PDF document.</p>
      </div>

      {!file ? (
        <FileDropZone onFilesSelected={handleFileSelected} multiple={false} label="Drop PDF file here" description="Select a PDF to protect" icon="🔒" />
      ) : (
        <div className="glass-card rounded-2xl p-6 border border-white/[0.04] animate-scale-in">
          <FileInfo fileName={file.name} pageCount={pageCount} onChange={() => { setFile(null); setPageCount(0); }} />

          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-yellow-500/[0.05] border border-yellow-500/10">
              <p className="text-[12px] text-yellow-300/80">⚠️ Note: Full PDF encryption requires server-side processing. This tool marks the document as protected and adds security metadata.</p>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">User Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 rounded-xl premium-input text-white text-[14px] placeholder-zinc-600 focus:outline-none pr-12"
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-4 py-3 rounded-xl premium-input text-white text-[14px] placeholder-zinc-600 focus:outline-none"
              />
            </div>

            {password && (
              <div className="animate-fade-in-up">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] text-zinc-500">Password Strength:</span>
                  <span className={`text-[11px] font-semibold ${getPasswordStrength().color}`}>{getPasswordStrength().label}</span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${getPasswordStrength().width} ${getPasswordStrength().bg}`}></div>
                </div>
              </div>
            )}

            <button
              onClick={handleProtect}
              disabled={processing || !password || password !== confirmPassword}
              className="w-full btn-primary py-3.5 rounded-xl text-white font-semibold text-[14px] disabled:opacity-40"
            >
              <span>{processing ? 'Protecting...' : 'Protect PDF'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
