import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface HeroMetricProps {
  pct: number; // 0 to 1
  label: string;
  subLabel?: string;
}

export function HeroMetric({ pct, label, subLabel }: HeroMetricProps) {
  const pctValue = pct * 100;
  
  let color = 'hsl(160,84%,39%)'; // green
  let textColor = 'text-success';
  if (pctValue < 30) {
    color = 'hsl(0,84%,60%)'; // red
    textColor = 'text-destructive';
  } else if (pctValue < 60) {
    color = 'hsl(38,92%,50%)'; // amber
    textColor = 'text-primary';
  }

  const data = [{ name: 'Recovery', value: pctValue, fill: color }];

  return (
    <div className="relative overflow-hidden rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 flex items-center justify-between transition-all duration-300 hover:shadow-[0_4px_24px_rgba(255,255,255,0.04)]">
      <div className="flex flex-col justify-center">
        <h2 className="font-heading text-lg font-bold text-foreground">{label}</h2>
        {subLabel && <p className="font-data text-xs text-muted-foreground mt-1">{subLabel}</p>}
      </div>
      
      <div className="relative h-24 w-24">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="75%" 
            outerRadius="100%" 
            barSize={10} 
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
              background={{ fill: 'rgba(255,255,255,0.05)' }}
              dataKey="value"
              cornerRadius={5}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-heading text-xl font-bold ${textColor}`}>
            {pctValue.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
