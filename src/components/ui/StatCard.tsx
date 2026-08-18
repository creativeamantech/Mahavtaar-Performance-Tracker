import { ReactNode } from 'react';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';

interface StatCardProps {
  label: string;
  value: string;
  subLabel?: string;
  accentColor?: 'primary' | 'success' | 'info' | 'destructive';
  icon?: ReactNode;
  trend?: number[];
}

const shadowColorMap = {
  primary: 'hover:shadow-[0_8px_32px_rgba(245,158,11,0.08)]',
  success: 'hover:shadow-[0_8px_32px_rgba(16,185,129,0.08)]',
  info: 'hover:shadow-[0_8px_32px_rgba(56,189,248,0.08)]',
  destructive: 'hover:shadow-[0_8px_32px_rgba(244,63,94,0.08)]',
};

const gradientMap = {
  primary: 'from-[hsl(38,92%,50%,0.3)]',
  success: 'from-[hsl(160,84%,39%,0.3)]',
  info: 'from-[hsl(217,91%,60%,0.3)]',
  destructive: 'from-[hsl(0,84%,60%,0.3)]',
};

const strokeColorMap = {
  primary: 'hsl(var(--primary))',
  success: 'hsl(var(--success))',
  info: 'hsl(var(--info))',
  destructive: 'hsl(var(--destructive))',
};

const textColorMap = {
  primary: 'text-primary',
  success: 'text-success',
  info: 'text-info',
  destructive: 'text-destructive',
};

const iconBgMap = {
  primary: 'bg-primary/10 border-primary/20',
  success: 'bg-success/10 border-success/20',
  info: 'bg-info/10 border-info/20',
  destructive: 'bg-destructive/10 border-destructive/20',
};

export function StatCard({ label, value, subLabel, accentColor = 'primary', icon, trend }: StatCardProps) {
  const chartData = trend?.map((val, i) => ({ val, index: i })) || [];
  return (
    <div className={`glass-card relative overflow-hidden p-5 hover:-translate-y-1 ${shadowColorMap[accentColor]} transition-all duration-300`}>
      {/* 1px Gradient Edge */}
      <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r ${gradientMap[accentColor]} to-transparent`} />
      
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`flex h-8 w-8 items-center justify-center rounded-md border ${iconBgMap[accentColor]}`}>
              {icon}
            </div>
          )}
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">{label}</span>
        </div>
        
        {trend && trend.length > 0 && (
          <div className="h-6 w-14 opacity-90">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <YAxis domain={['dataMin', 'dataMax']} hide />
                <Line
                  type="monotone"
                  dataKey="val"
                  stroke={strokeColorMap[accentColor]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      <div className={`font-data text-2xl font-bold ${textColorMap[accentColor]}`}>{value}</div>
      {subLabel && <div className="mt-1.5 font-data text-[10px] text-muted-foreground/70">{subLabel}</div>}
    </div>
  );
}
