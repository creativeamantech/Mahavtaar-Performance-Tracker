import { ReactNode } from 'react';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';

interface StatCardProps {
  size?: 'sm' | 'default' | 'lg';
  onClick?: () => void;
  label: string;
  value: string;
  subLabel?: string;
  accentColor?: 'primary' | 'success' | 'info' | 'destructive' | 'warning';
  icon?: ReactNode;
  trend?: number[];
}

const strokeColorMap = {
  primary: 'hsl(var(--primary))',
  success: 'hsl(var(--success))',
  info: 'hsl(var(--info))',
  destructive: 'hsl(var(--destructive))',
  warning: 'hsl(var(--warning))',
};

const textColorMap = {
  primary: 'text-primary',
  success: 'text-success',
  info: 'text-info',
  destructive: 'text-destructive',
  warning: 'text-warning',
};

const iconBgMap = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  info: 'bg-info/10 text-info',
  destructive: 'bg-destructive/10 text-destructive',
  warning: 'bg-warning/10 text-warning',
};

const borderColorMap = {
  primary: 'border-l-primary',
  success: 'border-l-success',
  info: 'border-l-info',
  destructive: 'border-l-destructive',
  warning: 'border-l-warning',
};

export function StatCard({ label, value, subLabel, accentColor = 'primary', icon, trend, size = 'default', onClick }: StatCardProps) {
  const chartData = trend?.map((val, i) => ({ val, index: i })) || [];

  return (
    <div 
      onClick={onClick}
      className={`bg-card rounded-xl border ${borderColorMap[accentColor]} border-l-4 ${size === 'sm' ? 'p-3 min-h-[100px]' : 'p-5 min-h-[120px]'} shadow-sm transition-shadow ${onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.98]' : ''}`}
    >
      <div className={`${size === 'sm' ? 'mb-2' : 'mb-4'} flex items-start justify-between`}>
        <div className="flex flex-col gap-1">
          <span className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
          <div className={`font-sans font-bold text-foreground ${size === 'sm' ? 'text-xl' : 'text-2xl'}`}>{value}</div>
        </div>
        {icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgMap[accentColor]}`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between h-6">
        {subLabel && <div className={`font-sans text-xs text-muted-foreground ${size === 'sm' ? 'hidden md:block' : ''}`}>{subLabel}</div>}
        {trend && trend.length > 0 && (
          <div className="h-6 w-16 opacity-90">
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
    </div>
  );
}
