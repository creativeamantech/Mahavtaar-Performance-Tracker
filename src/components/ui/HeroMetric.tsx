import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface HeroMetricProps {
  pct: number; // 0 to 1
  label: string;
  subLabel?: string;
}

export function HeroMetric({ pct, label, subLabel }: HeroMetricProps) {
  const pctValue = pct * 100;
  
  let color = 'hsl(var(--success))'; 
  let textColor = 'text-success';
  if (pctValue < 30) {
    color = 'hsl(var(--destructive))';
    textColor = 'text-destructive';
  } else if (pctValue < 60) {
    color = 'hsl(var(--primary))'; 
    textColor = 'text-primary';
  }

  const data = [{ name: 'Recovery', value: pctValue, fill: color }];

  return (
    <div className="glass-card relative overflow-hidden p-6 flex flex-col md:flex-row items-center justify-between hover:shadow-[0_8px_32px_rgba(255,255,255,0.02)] transition-all duration-300">
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 to-transparent" />
      
      <div className="flex flex-col justify-center mb-6 md:mb-0 pl-2">
        <h2 className="font-heading text-xl font-bold tracking-wide text-foreground uppercase">{label}</h2>
        {subLabel && <p className="font-data text-xs text-muted-foreground mt-2 max-w-sm leading-relaxed">{subLabel}</p>}
      </div>
      
      <div className="relative h-28 w-28 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="75%" 
            outerRadius="100%" 
            barSize={12} 
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: 'rgba(255,255,255,0.03)' }}
              dataKey="value"
              cornerRadius={6}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className={`font-data text-xl font-bold ${textColor}`}>
            {pctValue.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
