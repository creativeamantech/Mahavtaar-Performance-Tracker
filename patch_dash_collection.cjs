const fs = require('fs');

let dash = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');
dash = dash.replace(
  "acc.totalCollection += (Number(row.dac ?? row.DAC) || 0);",
  "if (c.mainPaid === 1) { acc.totalCollection += (Number(row.dac ?? row.DAC) || 0); }"
);
dash = dash.replace(
  "Total DAC collected",
  "DAC from Main Paid cases"
);

fs.writeFileSync('src/pages/Dashboard.tsx', dash);

let pivots = fs.readFileSync('src/lib/pivots.ts', 'utf-8');
pivots = pivots.replace(
  "map[city].collection += Number(r.dac ?? r.DAC) || 0;",
  "if (c.mainPaid === 1) { map[city].collection += Number(r.dac ?? r.DAC) || 0; }"
);
fs.writeFileSync('src/lib/pivots.ts', pivots);
console.log('patched');
