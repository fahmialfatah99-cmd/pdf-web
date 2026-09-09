import { useState } from 'react';
import { PDFDocument, PageSizes } from 'pdf-lib';
import FileDropZone from '../components/FileDropZone';
import { saveAs } from 'file-saver';

export default function ImageToPDF() {
  const [images, setImages] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [processing, setProcessing] = useState(false);

  const handleFilesSelected = (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    setImages(prev => [...prev, ...imageFiles]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const getPageSize = (): [number, number] => {
    switch (pageSize) {
      case 'a4': return PageSizes.A4;
      case 'letter': return PageSizes.Letter;
      case 'fit': return PageSizes.A4;
      default: return PageSizes.A4;
    }
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const imageFile of images) {
        const imageBytes = await imageFile.arrayBuffer();
        let image;
        if (imageFile.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }
        let pageWidth: number, pageHeight: number;
        if (pageSize === 'fit') {
          pageWidth = image.width;
          pageHeight = image.height;
        } else {
          [pageWidth, pageHeight] = getPageSize();
        }
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const xScale = pageWidth / image.width;
        const yScale = pageHeight / image.height;
        const scale = Math.min(xScale, yScale) * 0.95;
        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;
        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;
        page.drawImage(image, { x, y, width: scaledWidth, height: scaledHeight });
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      saveAs(blob, 'images-to-pdf.pdf');
    } catch (error) {
      console.error('Conversion failed:', error);
      alert('Failed to convert images to PDF.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Image to PDF</h2>
        <p className="text-[14px] text-zinc-400">Convert images (JPG, PNG) to a PDF document.</p>
      </div>

      <FileDropZone onFilesSelected={handleFilesSelected} accept="image/jpeg,image/png,image/jpg" label="Drop images here" description="Supports JPG and PNG formats" icon="🖼️" />

      {images.length > 0 && (
        <div className="mt-6 glass-card rounded-2xl p-6 border border-white/[0.04] animate-scale-in">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <span className="text-sm">🖼️</span>
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-white">Images</h3>
                <p className="text-[11px] text-zinc-500">{images.length} images selected</p>
              </div>
            </div>
            <button onClick={() => setImages([])} className="px-3 py-1.5 rounded-lg bg-red-500/[0.07] border border-red-500/10 text-red-400 text-[12px] font-medium hover:bg-red-500/[0.12] transition-colors">Clear All</button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-6 max-h-56 overflow-y-auto">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-xl bg-white/[0.02] border border-white/[0.04] overflow-hidden">
                  <img src={URL.createObjectURL(img)} alt={img.name} className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="mb-5">
            <label className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-3 block">Page Size</label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: 'a4', label: 'A4', icon: '📐' },
                { value: 'letter', label: 'Letter', icon: '📄' },
                { value: 'fit', label: 'Fit to Image', icon: '📏' },
              ] as const).map(size => (
                <button
                  key={size.value}
                  onClick={() => setPageSize(size.value)}
                  className={`p-3 rounded-xl border text-[13px] font-medium transition-all ${pageSize === size.value ? 'bg-indigo-500/[0.07] border-indigo-500/20 text-white' : 'bg-white/[0.02] border-white/[0.04] text-zinc-400 hover:border-white/[0.08]'}`}
                >
                  {size.icon} {size.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleConvert}
            disabled={processing}
            className="w-full btn-primary py-3.5 rounded-xl text-white font-semibold text-[14px] disabled:opacity-40"
          >
            <span>{processing ? 'Converting...' : `Convert ${images.length} Images to PDF`}</span>
          </button>
        </div>
      )}
    </div>
  );
}
