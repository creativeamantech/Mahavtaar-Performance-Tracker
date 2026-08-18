import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  subLabel?: string;
  accentColor?: 'primary' | 'success' | 'info' | 'destructive';
  icon?: ReactNode;
}

const borderColorMap = {
  primary: 'border-t-primary',
  success: 'border-t-success',
  info: 'border-t-info',
  destructive: 'border-t-destructive',
};

const textColorMap = {
  primary: 'text-primary',
  success: 'text-success',
  info: 'text-info',
  destructive: 'text-destructive',
};

export function StatCard({ label, value, subLabel, accentColor = 'primary', icon }: StatCardProps) {
  return (
    <div className={`rounded-lg border border-border bg-card p-5 ${borderColorMap[accentColor]} border-t-[3px]`}>
      <div className="mb-1 flex items-center gap-2">
        {icon}
        <span className="font-data text-[10px] uppercase tracking-[2px] text-muted-foreground">{label}</span>
      </div>
      <div className={`font-heading text-2xl font-bold ${textColorMap[accentColor]}`}>{value}</div>
      {subLabel && <span className="font-data text-[11px] text-muted-foreground">{subLabel}</span>}
    </div>
  );
}
