const fs = require('fs');

let dash = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

dash = dash.replace(
  '<th className="p-3 font-sans text-xs text-muted-foreground font-semibold text-right">Paid %</th>',
  '<th className="p-3 font-sans text-xs text-muted-foreground font-semibold text-right">Sum of %</th>'
);

dash = dash.replace(
  "const casePct = city.count > 0 ? (city.paid / city.count) * 100 : 0;",
  "const posPct = city.pct;"
);

dash = dash.replace(
  '<td className="p-3 text-right text-foreground">{casePct.toFixed(1)}%</td>',
  '<td className="p-3 text-right text-foreground font-bold">{fmtPct(posPct)}</td>'
);

fs.writeFileSync('src/pages/Dashboard.tsx', dash);
console.log('patched');
