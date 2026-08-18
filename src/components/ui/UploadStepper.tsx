import { useRef, useState } from 'react';
import { CheckCircle2, Circle, UploadCloud, Loader2 } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  optional?: boolean;
  onFileSelect: (file: File) => void;
  status: 'pending' | 'uploading' | 'done' | 'error';
  lastUpload?: string | null;
}

export function UploadStepper({ steps }: { steps: Step[] }) {
  const [activeStep, setActiveStep] = useState<string>(steps[0].id);

  return (
    <div className="mb-6 bg-card border rounded-xl shadow-sm p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="flex flex-col md:flex-row w-full items-stretch md:items-start gap-4">
        {steps.map((step, index) => {
          const isActive = activeStep === step.id;
          const isDone = step.status === 'done';
          const isUploading = step.status === 'uploading';
          
          return (
            <div 
              key={step.id} 
              className={`flex-1 relative transition-all duration-300 ${isActive ? 'scale-[1.02]' : 'opacity-70 hover:opacity-100'}`}
              onClick={() => setActiveStep(step.id)}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute left-[50%] right-[-50%] top-4 h-[1px] bg-border -z-10" />
              )}
              
              <div className={`cursor-pointer rounded-xl border ${isActive ? 'border-primary/50 bg-[rgba(245,158,11,0.03)] shadow-[0_0_20px_rgba(245,158,11,0.05)]' : 'border-[rgba(255,255,255,0.06)] bg-surface-1'} p-5 flex flex-col items-center justify-center text-center h-full backdrop-blur-md`}>
                <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full border ${isDone ? 'border-success bg-success/10 text-success' : isUploading ? 'border-primary bg-primary/10 text-primary' : 'border-[rgba(255,255,255,0.2)] text-muted-foreground'}`}>
                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="font-sans text-xs font-bold">{index + 1}</span>}
                </div>
                
                <h4 className={`font-sans text-xs font-bold tracking-wider uppercase mb-1 ${isActive ? 'text-primary' : 'text-foreground'}`}>
                  {step.title}
                </h4>
                
                <span className="font-sans text-[10px] text-muted-foreground mb-3">
                  {step.optional ? '(Optional)' : '(Required)'}
                </span>

                {isActive && (
                  <FileDropzone onFileSelect={step.onFileSelect} disabled={isUploading} />
                )}
                
                {!isActive && step.lastUpload && (
                  <div className="font-sans text-[10px] text-success flex items-center gap-1 mt-2">
                    <CheckCircle2 className="h-3 w-3" /> {step.lastUpload}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FileDropzone({ onFileSelect, disabled }: { onFileSelect: (f: File) => void, disabled: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (disabled) return;
        const file = e.dataTransfer.files[0];
        if (file) onFileSelect(file);
      }}
      className={`w-full rounded-md border border-dashed p-3 flex flex-col items-center justify-center transition-colors ${dragging ? 'border-primary bg-primary/10' : 'border-[rgba(255,255,255,0.15)] hover:border-primary/50'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input 
        ref={inputRef} 
        type="file" 
        accept=".xlsx,.xls,.csv" 
        className="hidden" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
          e.target.value = '';
        }} 
      />
      <UploadCloud className="h-5 w-5 text-muted-foreground mb-1" />
      <span className="font-sans text-[10px] text-muted-foreground">Click or Drop</span>
    </div>
  );
}
