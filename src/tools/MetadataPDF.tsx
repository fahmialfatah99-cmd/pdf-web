import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileDropZone from '../components/FileDropZone';
import FileInfo from '../components/FileInfo';
import { saveAs } from 'file-saver';

export default function MetadataPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({ title: '', author: '', subject: '', keywords: '', creator: '', producer: '' });
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    const pdfFile = files[0];
    if (!pdfFile) return;
    setFile(pdfFile);
    setSaved(false);
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      setPageCount(pdf.getPageCount());
      setMetadata({
        title: pdf.getTitle() || '',
        author: pdf.getAuthor() || '',
        subject: pdf.getSubject() || '',
        keywords: pdf.getKeywords() || '',
        creator: pdf.getCreator() || '',
        producer: pdf.getProducer() || '',
      });
    } catch { alert('Failed to read PDF'); }
  };

  const handleSave = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const pdfBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      pdf.setTitle(metadata.title);
      pdf.setAuthor(metadata.author);
      pdf.setSubject(metadata.subject);
      pdf.setKeywords(metadata.keywords.split(',').map(k => k.trim()));
      pdf.setCreator(metadata.creator);
      pdf.setProducer(metadata.producer);
      const resultBytes = await pdf.save();
      const blob = new Blob([resultBytes as unknown as BlobPart], { type: 'application/pdf' });
      saveAs(blob, `metadata-updated-${file.name}`);
      setSaved(true);
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save metadata');
    } finally { setProcessing(false); }
  };

  const fields = [
    { key: 'title' as const, label: 'Title', icon: '📝', placeholder: 'Document title' },
    { key: 'author' as const, label: 'Author', icon: '👤', placeholder: 'Document author' },
    { key: 'subject' as const, label: 'Subject', icon: '📋', placeholder: 'Document subject' },
    { key: 'keywords' as const, label: 'Keywords', icon: '🏷️', placeholder: 'keyword1, keyword2, keyword3' },
    { key: 'creator' as const, label: 'Creator', icon: '🛠️', placeholder: 'Application that created the PDF' },
    { key: 'producer' as const, label: 'Producer', icon: '⚙️', placeholder: 'PDF producer' },
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Edit PDF Metadata</h2>
        <p className="text-[14px] text-zinc-400">View and edit document properties of your PDF.</p>
      </div>

      {!file ? (
        <FileDropZone onFilesSelected={handleFileSelected} multiple={false} label="Drop PDF file here" description="Select a PDF to edit metadata" icon="📝" />
      ) : (
        <div className="glass-card rounded-2xl p-6 border border-white/[0.04] animate-scale-in">
          <FileInfo fileName={file.name} pageCount={pageCount} fileSize={file.size} onChange={() => { setFile(null); setSaved(false); }} />

          {saved && (
            <div className="mb-5 p-4 rounded-xl bg-green-500/[0.05] border border-green-500/10 animate-scale-in">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-[13px] font-medium text-green-400">Metadata saved and file downloaded!</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {fields.map(field => (
              <div key={field.key}>
                <label className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span>{field.icon}</span>
                  {field.label}
                </label>
                <input
                  type="text"
                  value={metadata[field.key]}
                  onChange={(e) => setMetadata(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-xl premium-input text-white text-[14px] placeholder-zinc-600 focus:outline-none"
                />
              </div>
            ))}

            <button onClick={handleSave} disabled={processing} className="w-full btn-primary py-3.5 rounded-xl text-white font-semibold text-[14px] disabled:opacity-40">
              <span>{processing ? 'Saving...' : 'Save Metadata'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
