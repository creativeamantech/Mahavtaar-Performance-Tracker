const fs = require('fs');

const path = 'src/pages/DataExplorer.tsx';
let code = fs.readFileSync(path, 'utf-8');

// Dynamic Payment Status Design
const statusRenderStr = `
                        {isPaid ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="bg-success/15 text-success px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Main Paid</span>
                            <div className="flex items-center gap-1.5 w-24">
                              <div className="h-1.5 flex-1 bg-success/20 rounded-full overflow-hidden">
                                <div className="h-full bg-success rounded-full" style={{ width: \`\${Math.min((Number(r.dac ?? r.DAC) || 0) / (Number(r.principal_outstanding) || 1) * 100, 100)}%\` }} />
                              </div>
                              <span className="text-[10px] font-bold text-success">{Math.min(Math.round(((Number(r.dac ?? r.DAC) || 0) / (Number(r.principal_outstanding) || 1)) * 100), 100)}%</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <span className="bg-destructive/15 text-destructive px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Unpaid</span>
                            {(Number(r.dac ?? r.DAC) || 0) > 0 && (
                               <span className="text-[10px] text-muted-foreground font-semibold">Partial DAC</span>
                            )}
                          </div>
                        )}
`;

code = code.replace(
  /\{isPaid \?\s*\(\s*<span className="bg-success\/15[^>]*>Main Paid<\/span>\s*\)\s*:\s*\(\s*<span className="bg-destructive\/15[^>]*>Unpaid<\/span>\s*\)\}/s,
  statusRenderStr
);

// Fix Pagination Bits - Increase items per page from 100 to 500
code = code.replace(
  "const itemsPerPage = 100;",
  "const itemsPerPage = 500;"
);

fs.writeFileSync(path, code);
console.log('Fixed UI and Pagination.');
