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
  primary: 'hover:shadow-[0_4px_24px_rgba(245,158,11,0.08)]',
  success: 'hover:shadow-[0_4px_24px_rgba(16,185,129,0.08)]',
  info: 'hover:shadow-[0_4px_24px_rgba(56,189,248,0.08)]',
  destructive: 'hover:shadow-[0_4px_24px_rgba(244,63,94,0.08)]',
};

const gradientMap = {
  primary: 'from-[hsl(38,92%,50%,0.2)]',
  success: 'from-[hsl(160,84%,39%,0.2)]',
  info: 'from-[hsl(217,91%,60%,0.2)]',
  destructive: 'from-[hsl(0,84%,60%,0.2)]',
};

const strokeColorMap = {
  primary: 'hsl(38,92%,50%)',
  success: 'hsl(160,84%,39%)',
  info: 'hsl(217,91%,60%)',
  destructive: 'hsl(0,84%,60%)',
};

const textColorMap = {
  primary: 'text-primary',
  success: 'text-success',
  info: 'text-info',
  destructive: 'text-destructive',
};

export function StatCard({ label, value, subLabel, accentColor = 'primary', icon, trend }: StatCardProps) {
  const chartData = trend?.map((val, i) => ({ val, index: i })) || [];

  return (
    <div className={`relative overflow-hidden rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 transition-all duration-300 hover:-translate-y-0.5 ${shadowColorMap[accentColor]}`}>
      {/* Top Gradient Edge */}
      <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r ${gradientMap[accentColor]} to-transparent`} />
      
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-data text-[10px] uppercase tracking-[2px] text-muted-foreground">{label}</span>
        </div>
        {trend && trend.length > 0 && (
          <div className="h-6 w-12 opacity-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <YAxis domain={['dataMin', 'dataMax']} hide />
                <Line
                  type="monotone"
                  dataKey="val"
                  stroke={strokeColorMap[accentColor]}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <div className={`font-heading text-2xl font-bold ${textColorMap[accentColor]}`}>{value}</div>
      {subLabel && <div className="mt-1 font-data text-[11px] text-muted-foreground">{subLabel}</div>}
    </div>
  );
}
