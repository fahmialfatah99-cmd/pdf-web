import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileDropZone from '../components/FileDropZone';
import { saveAs } from 'file-saver';

export default function MetadataPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: '',
    producer: '',
  });
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
    } catch {
      alert('Failed to read PDF');
    }
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
    } finally {
      setProcessing(false);
    }
  };

  const fields = [
    { key: 'title', label: 'Title', icon: '📝', placeholder: 'Document title' },
    { key: 'author', label: 'Author', icon: '👤', placeholder: 'Document author' },
    { key: 'subject', label: 'Subject', icon: '📋', placeholder: 'Document subject' },
    { key: 'keywords', label: 'Keywords', icon: '🏷️', placeholder: 'keyword1, keyword2, keyword3' },
    { key: 'creator', label: 'Creator', icon: '🛠️', placeholder: 'Application that created the PDF' },
    { key: 'producer', label: 'Producer', icon: '⚙️', placeholder: 'PDF producer' },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Edit PDF Metadata</h2>
        <p className="text-slate-400">View and edit document properties of your PDF.</p>
      </div>

      {!file ? (
        <FileDropZone
          onFilesSelected={handleFileSelected}
          multiple={false}
          label="Drop PDF file here"
          description="Select a PDF to edit metadata"
          icon="📝"
        />
      ) : (
        <div className="glass-card rounded-2xl p-6 glow-border">
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-2xl">📄</span>
            <div className="flex-1">
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-sm text-slate-400">{pageCount} pages • {(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => { setFile(null); setSaved(false); }} className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm">Change</button>
          </div>

          {saved && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              ✅ Metadata saved and file downloaded!
            </div>
          )}

          <div className="space-y-4">
            {fields.map(field => (
              <div key={field.key}>
                <label className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <span>{field.icon}</span>
                  {field.label}
                </label>
                <input
                  type="text"
                  value={metadata[field.key]}
                  onChange={(e) => setMetadata(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            ))}

            <button
              onClick={handleSave}
              disabled={processing}
              className="w-full btn-primary py-3 rounded-xl text-white font-semibold disabled:opacity-50"
            >
              {processing ? '⏳ Saving...' : '💾 Save Metadata'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
