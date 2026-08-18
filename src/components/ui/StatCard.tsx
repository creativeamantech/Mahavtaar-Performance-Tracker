import { ReactNode } from 'react';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';

interface StatCardProps {
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

export function StatCard({ label, value, subLabel, accentColor = 'primary', icon, trend }: StatCardProps) {
  const chartData = trend?.map((val, i) => ({ val, index: i })) || [];

  return (
    <div className={`bg-card rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="mb-4 flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
          <div className={`font-sans text-2xl font-bold text-foreground`}>{value}</div>
        </div>
        {icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgMap[accentColor]}`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between h-6">
        {subLabel && <div className="font-sans text-xs text-muted-foreground">{subLabel}</div>}
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
