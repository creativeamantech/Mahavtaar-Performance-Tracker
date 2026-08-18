import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface TargetInputProps {
  targetKey: string;
  initialPct: number;
  onSave: (key: string, val: number) => void;
}

export function TargetInput({ targetKey, initialPct, onSave }: TargetInputProps) {
  const [val, setVal] = useState(initialPct.toString());

  useEffect(() => {
    setVal(initialPct.toString());
  }, [initialPct]);

  const handleBlur = () => {
    const num = parseFloat(val);
    if (isNaN(num) || num < 0) {
      toast.error('Invalid percentage');
      setVal(initialPct.toString());
    } else if (num !== initialPct) {
      onSave(targetKey, num);
      toast.success('Saved ✓');
    }
  };

  return (
    <input
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }
      }}
      className="h-6 w-16 rounded border border-border bg-input px-2 text-right outline-none focus:border-primary"
    />
  );
}
