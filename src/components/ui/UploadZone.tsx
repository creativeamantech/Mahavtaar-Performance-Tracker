import { useCallback, useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
  title: string;
  accept?: string;
  onFileSelect: (file: File) => void;
  lastUpload?: { fileName: string; recordCount: number; createdAt: string } | null;
  loading?: boolean;
  error?: string | null;
}

export function UploadZone({ title, accept = '.xlsx,.xls,.csv', onFileSelect, lastUpload, loading, error }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = '';
  }, [onFileSelect]);

  return (
    <div className="bg-card border rounded-xl shadow-sm p-6 rounded-xl">
      <h3 className="mb-4 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-primary">{title}</h3>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all ${
          dragging ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(245,158,11,0.1)]' : error ? 'border-destructive bg-destructive/10' : 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] hover:border-primary/50 hover:bg-[rgba(255,255,255,0.04)]'
        }`}
      >
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs">Processing...</span>
          </div>
        ) : (
          <>
            <Upload className={`mb-2 h-6 w-6 ${dragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-xs text-muted-foreground">
              {dragging ? 'Release to upload' : 'Drop file here or click to browse'}
            </span>
          </>
        )}
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" /> {error}
        </div>
      )}
      {lastUpload && (
        <div className="mt-2 flex items-center gap-1 text-xs text-success">
          <CheckCircle className="h-3 w-3" />
          {lastUpload.fileName} — {lastUpload.recordCount} records
        </div>
      )}
    </div>
  );
}
