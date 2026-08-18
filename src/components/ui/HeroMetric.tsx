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
    color = 'hsl(var(--warning))'; 
    textColor = 'text-warning';
  }

  const data = [{ name: 'Recovery', value: pctValue, fill: color }];

  return (
    <div className="bg-card border rounded-xl p-6 flex flex-col items-center text-center md:flex-row md:items-center md:text-left justify-between shadow-sm border-l-4 border-l-success">
      <div className="flex flex-col justify-center mb-6 md:mb-0">
        <h2 className="font-sans text-xl font-bold tracking-tight text-foreground">{label}</h2>
        {subLabel && <p className="font-sans text-sm text-muted-foreground mt-1 max-w-sm">{subLabel}</p>}
      </div>
      
      <div className="relative h-[100px] w-[100px] md:h-28 md:w-28 shrink-0">
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
              background={{ fill: 'hsl(var(--muted))' }}
              dataKey="value"
              cornerRadius={6}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className={`font-sans text-xl font-bold ${textColor}`}>
            {pctValue.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
