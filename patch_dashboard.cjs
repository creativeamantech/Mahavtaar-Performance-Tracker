const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// Replace rollback pct and KPI 2 with Target POS
code = code.replace(
  "const rollbackPct = stats.totalPOS ? stats.rollbackPOS / stats.totalPOS : 0;",
  "// No rollback"
);

// KPI 1 - Actual Recovery % -> Target POS
const kpi1Old = `{/* KPI 1 - Actual Recovery % */}
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actual Recovery %</h3>
                <span className="bg-success/10 text-success px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {fmtPct(actualPct)}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-heading text-4xl font-bold text-foreground">{(actualPct * 100).toFixed(1)}</span>
                <span className="font-sans text-lg font-semibold text-muted-foreground">%</span>
              </div>
              <div className="flex justify-between text-xs font-sans text-muted-foreground mb-2">
                <span>Total POS: {fmtCur(stats.totalPOS)}</span>
                <span>Recovered: {fmtCur(stats.paidPOS)}</span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: \`\${Math.min(actualPct * 100, 100)}%\` }}></div>
              </div>
            </div>`;

const kpi2Old = `{/* KPI 2 - Rollback % */}
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rollback %</h3>
                <span className={\`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 \${rollbackPct > 0.1 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}\`}>
                  {rollbackPct > 0.1 ? 'High' : 'Normal'}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-auto">
                <span className={\`font-heading text-4xl font-bold \${rollbackPct > 0.1 ? 'text-destructive' : 'text-foreground'}\`}>{(rollbackPct * 100).toFixed(1)}</span>
                <span className="font-sans text-lg font-semibold text-muted-foreground">%</span>
              </div>
              <p className="font-sans text-xs text-muted-foreground mt-2">Overall rollback rate across {filteredRecords.length} records</p>
            </div>`;

const kpi1New = `{/* KPI 1 - Recovery % */}
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recovery Rate</h3>
                <span className="bg-success/10 text-success px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {fmtPct(actualPct)}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-auto">
                <span className="font-heading text-4xl font-bold text-foreground">{(actualPct * 100).toFixed(1)}</span>
                <span className="font-sans text-lg font-semibold text-muted-foreground">%</span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-4">
                <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: \`\${Math.min(actualPct * 100, 100)}%\` }}></div>
              </div>
            </div>`;

const kpi2New = `{/* KPI 2 - Recovered POS */}
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paid POS</h3>
                <DollarSign className="h-4 w-4 text-success" />
              </div>
              <div className="flex flex-col mt-auto">
                <span className="font-heading text-2xl lg:text-3xl font-bold text-success">{fmtCur(stats.paidPOS)}</span>
                <p className="font-sans text-xs text-muted-foreground mt-1">Total POS of Main Paid cases</p>
              </div>
            </div>`;


code = code.replace(kpi1Old, kpi1New);
code = code.replace(kpi2Old, kpi2New);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('patched');
