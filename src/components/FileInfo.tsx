interface FileInfoProps {
  fileName: string;
  pageCount?: number;
  fileSize?: number;
  onChange: () => void;
  extra?: React.ReactNode;
}

export default function FileInfo({ fileName, pageCount, fileSize, onChange, extra }: FileInfoProps) {
  return (
    <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border border-indigo-500/10 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-white truncate">{fileName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {pageCount !== undefined && (
            <span className="text-[11px] text-zinc-500">{pageCount} pages</span>
          )}
          {fileSize !== undefined && (
            <>
              <span className="text-[11px] text-zinc-700">•</span>
              <span className="text-[11px] text-zinc-500">{(fileSize / 1024).toFixed(1)} KB</span>
            </>
          )}
          {extra}
        </div>
      </div>
      <button
        onClick={onChange}
        className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-zinc-400 text-[12px] font-medium hover:bg-white/[0.06] hover:text-white transition-all"
      >
        Change
      </button>
    </div>
  );
}
