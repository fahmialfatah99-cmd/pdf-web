import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import FileDropZone from '../components/FileDropZone';
import FileInfo from '../components/FileInfo';
import { saveAs } from 'file-saver';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface ExtractedRowItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function PDFToExcel() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [extractMode, setExtractMode] = useState<'per-page' | 'combined'>('per-page');

  const handleFileSelected = async (files: File[]) => {
    const pdfFile = files[0];
    if (!pdfFile) return;
    setFile(pdfFile);
    setDone(false);
    setProgress(0);

    try {
      const buffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      setPageCount(pdf.numPages);
    } catch (err) {
      console.error('Failed to read PDF:', err);
      alert('Failed to read PDF file');
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      const numPages = pdf.numPages;

      const wb = XLSX.utils.book_new();
      const combinedRows: string[][] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        setProgress(Math.round(((pageNum - 1) / numPages) * 100));
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const items: ExtractedRowItem[] = [];

        for (const item of textContent.items) {
          if ('str' in item && item.str && item.str.trim() !== '') {
            items.push({
              text: item.str,
              x: item.transform[4],
              y: item.transform[5],
              width: item.width,
              height: item.height || 10,
            });
          }
        }

        // Sort items by Y (descending: top to bottom)
        items.sort((a, b) => b.y - a.y);

        // Group into lines based on Y proximity
        const lines: ExtractedRowItem[][] = [];
        for (const item of items) {
          let placed = false;
          for (const line of lines) {
            const lineY = line[0].y;
            const threshold = Math.max(item.height, line[0].height, 8) * 0.6;
            if (Math.abs(lineY - item.y) <= threshold) {
              line.push(item);
              placed = true;
              break;
            }
          }
          if (!placed) {
            lines.push([item]);
          }
        }

        // Within each line, sort by X (left to right)
        const pageGrid: string[][] = [];
        for (const line of lines) {
          line.sort((a, b) => a.x - b.x);

          const rowCells: string[] = [];
          for (let i = 0; i < line.length; i++) {
            const current = line[i];
            // If significant gap between items, leave blank cells or keep separated
            if (i > 0) {
              const prev = line[i - 1];
              const gap = current.x - (prev.x + prev.width);
              // If gap is large, add empty columns
              const emptyCols = Math.min(Math.max(0, Math.floor(gap / 45)), 10);
              for (let g = 0; g < emptyCols; g++) {
                rowCells.push('');
              }
            }
            rowCells.push(current.text);
          }
          pageGrid.push(rowCells);
        }

        if (extractMode === 'per-page') {
          const ws = XLSX.utils.aoa_to_sheet(pageGrid);
          XLSX.utils.book_append_sheet(wb, ws, `Page ${pageNum}`);
        } else {
          if (combinedRows.length > 0 && pageGrid.length > 0) {
            combinedRows.push([]); // blank separator row
          }
          combinedRows.push(...pageGrid);
        }
      }

      if (extractMode === 'combined') {
        const ws = XLSX.utils.aoa_to_sheet(combinedRows);
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      }

      setProgress(100);
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const baseName = file.name.replace(/\.pdf$/i, '');
      saveAs(blob, `${baseName}.xlsx`);
      setDone(true);
    } catch (error) {
      console.error('PDF to Excel conversion failed:', error);
      alert('Failed to convert PDF to Excel');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">PDF to Excel</h2>
        <p className="text-[14px] text-zinc-400">
          Extract tables and text from your PDF document into an Excel spreadsheet.
        </p>
      </div>

      {!file ? (
        <FileDropZone
          onFilesSelected={handleFileSelected}
          multiple={false}
          label="Drop PDF file here"
          description="Select a PDF to convert to Excel"
          icon="📊"
        />
      ) : (
        <div className="glass-card rounded-2xl p-6 border border-white/[0.04] animate-scale-in">
          <FileInfo
            fileName={file.name}
            pageCount={pageCount}
            fileSize={file.size}
            onChange={() => {
              setFile(null);
              setPageCount(0);
              setDone(false);
              setProgress(0);
            }}
          />

          <div className="space-y-5 mb-6">
            <div>
              <label className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                Worksheet Structure
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExtractMode('per-page')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    extractMode === 'per-page'
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-white'
                      : 'bg-white/[0.02] border-white/[0.04] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <p className="text-[13px] font-semibold">Separate Sheets</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">One sheet per PDF page</p>
                </button>

                <button
                  type="button"
                  onClick={() => setExtractMode('combined')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    extractMode === 'combined'
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-white'
                      : 'bg-white/[0.02] border-white/[0.04] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <p className="text-[13px] font-semibold">Single Sheet</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Combine all pages into one sheet</p>
                </button>
              </div>
            </div>

            {processing && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex justify-between text-[12px] mb-2">
                  <span className="text-zinc-400">Converting...</span>
                  <span className="text-indigo-400 font-semibold">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {done && (
              <div className="p-4 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10 flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-emerald-400">Conversion Complete!</p>
                  <p className="text-[12px] text-zinc-500">Your Excel file has been downloaded.</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleConvert}
            disabled={processing}
            className="w-full btn-primary py-3.5 rounded-xl text-white font-semibold text-[14px] disabled:opacity-40"
          >
            <span>{processing ? `Converting (${progress}%)...` : 'Convert to Excel (.xlsx)'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
