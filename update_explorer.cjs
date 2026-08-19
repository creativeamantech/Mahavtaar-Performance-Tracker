const fs = require('fs');

const path = 'src/pages/DataExplorer.tsx';
let code = fs.readFileSync(path, 'utf-8');

// Add Sheet imports
const importsToAdd = `
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
`;

code = code.replace("import { ResponsiveFilter }", importsToAdd.trim() + "\nimport { ResponsiveFilter }");

// Add State for selected record
const stateToAdd = `
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
`;
code = code.replace("const [page, setPage]", stateToAdd + "\n  const [page, setPage]");

// Make name and agreement number clickable
code = code.replace(
  '<td className="p-3 text-foreground font-medium">{r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || \'-\'}</td>',
  '<td className="p-3 text-primary font-medium cursor-pointer hover:underline" onClick={() => setSelectedRecord(r)}>{r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || \'-\'}</td>'
);

code = code.replace(
  '<td className="p-3 text-foreground">{r.customer_name || r.CUSTOMERNAME || r[\'Customer Name\'] || r.CUSTOMER_NAME || r.customername || \'-\'}</td>',
  '<td className="p-3 text-primary cursor-pointer hover:underline font-medium" onClick={() => setSelectedRecord(r)}>{r.customer_name || r.CUSTOMERNAME || r[\'Customer Name\'] || r.CUSTOMER_NAME || r.customername || \'-\'}</td>'
);

// Add Sheet to the bottom of the component (before the last closing div of AppLayout)
const sheetComponent = `
      <Sheet open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl overflow-hidden flex flex-col p-0">
          {selectedRecord && (() => {
            const c = calculateRow(selectedRecord);
            const isPaid = c.mainPaid === 1;
            return (
              <>
                <SheetHeader className="p-6 pb-4 border-b border-border bg-muted/20">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <SheetTitle className="text-2xl font-bold tracking-tight mb-1 text-foreground">
                        {selectedRecord.customer_name || selectedRecord.CUSTOMERNAME || selectedRecord['Customer Name'] || selectedRecord.CUSTOMER_NAME || selectedRecord.customername || '-'}
                      </SheetTitle>
                      <SheetDescription className="text-base text-muted-foreground font-medium">
                        {selectedRecord.agreementid || selectedRecord.agreement_no || selectedRecord.AGREEMENTNO || selectedRecord.AGREEMENTID || '-'}
                      </SheetDescription>
                    </div>
                    {isPaid ? (
                       <Badge variant="default" className="bg-success text-success-foreground hover:bg-success/90 uppercase font-bold tracking-wider px-3 py-1 text-xs">
                         Main Paid
                       </Badge>
                    ) : (
                       <Badge variant="outline" className="text-muted-foreground uppercase font-bold tracking-wider px-3 py-1 text-xs">
                         Unpaid
                       </Badge>
                    )}
                  </div>
                </SheetHeader>
                <ScrollArea className="flex-1 p-6">
                  <div className="grid gap-6">
                    {/* Financial Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Principal Outstanding</div>
                        <div className="text-2xl font-bold text-foreground">{fmtCur(Number(selectedRecord.principal_outstanding) || 0)}</div>
                      </div>
                      <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
                        <div className="text-sm font-medium text-muted-foreground mb-1">DAC Amount</div>
                        <div className="text-2xl font-bold text-foreground">{fmtCur(Number(selectedRecord.dac ?? selectedRecord.DAC) || 0)}</div>
                      </div>
                      <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
                        <div className="text-sm font-medium text-muted-foreground mb-1">EMI Amount</div>
                        <div className="text-xl font-semibold text-foreground">{fmtCur(Number(selectedRecord.emi_amt) || 0)}</div>
                      </div>
                      <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
                        <div className="text-sm font-medium text-muted-foreground mb-1">New Total</div>
                        <div className="text-xl font-semibold text-foreground">{fmtCur(Number(selectedRecord.new_total) || 0)}</div>
                      </div>
                    </div>

                    {/* All Raw Data */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                        <Database className="w-5 h-5 text-muted-foreground" />
                        Full Record Details
                      </h4>
                      <div className="bg-muted/30 border border-border rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <tbody className="divide-y divide-border">
                            {Object.entries(selectedRecord).filter(([k,v]) => v !== null && v !== undefined && v !== '').map(([key, value]) => (
                              <tr key={key} className="hover:bg-muted/50 transition-colors">
                                <th className="p-3 font-medium text-muted-foreground w-1/3 align-top break-words">
                                  {key}
                                </th>
                                <td className="p-3 text-foreground font-mono text-xs break-words">
                                  {String(value)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
`;

// Insert the sheet before `</AppLayout>`
code = code.replace("</AppLayout>", sheetComponent + "\n    </AppLayout>");

fs.writeFileSync(path, code);
console.log('Added Sheet to DataExplorer');
