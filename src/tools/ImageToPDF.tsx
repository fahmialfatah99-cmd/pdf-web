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

        // Calculate scaling to fit image on page
        const xScale = pageWidth / image.width;
        const yScale = pageHeight / image.height;
        const scale = Math.min(xScale, yScale) * 0.95; // 95% to add margin

        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;

        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;

        page.drawImage(image, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      saveAs(blob, 'images-to-pdf.pdf');
    } catch (error) {
      console.error('Conversion failed:', error);
      alert('Failed to convert images to PDF. Make sure images are JPG or PNG format.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Image to PDF</h2>
        <p className="text-slate-400">Convert images (JPG, PNG) to a PDF document.</p>
      </div>

      <FileDropZone
        onFilesSelected={handleFilesSelected}
        accept="image/jpeg,image/png,image/jpg"
        label="Drop images here"
        description="Supports JPG and PNG formats"
        icon="🖼️"
      />

      {images.length > 0 && (
        <div className="mt-6 glass-card rounded-2xl p-6 glow-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Images ({images.length})</h3>
            <button
              onClick={() => setImages([])}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6 max-h-48 overflow-y-auto">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
                <p className="text-xs text-slate-400 mt-1 truncate">{img.name}</p>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-slate-300 mb-2 block">Page Size</label>
            <div className="flex gap-3">
              {(['a4', 'letter', 'fit'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setPageSize(size)}
                  className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${pageSize === size ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
                >
                  {size === 'a4' ? '📐 A4' : size === 'letter' ? '📄 Letter' : '📏 Fit to Image'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleConvert}
            disabled={processing}
            className="w-full btn-primary py-3 rounded-xl text-white font-semibold disabled:opacity-50"
          >
            {processing ? '⏳ Converting...' : `🖼️ Convert ${images.length} Images to PDF`}
          </button>
        </div>
      )}
    </div>
  );
}
