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
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider">{title}</h3>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-6 transition-colors ${
          dragging ? 'border-primary bg-primary/5' : error ? 'border-destructive' : 'border-border hover:border-muted-foreground'
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
