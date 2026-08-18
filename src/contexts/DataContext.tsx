import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { parseMainFile, parsePaidFile, mergePaidIntoRecords, parseAdditionalFile, mergeAdditionalIntoRecords, parseCorrectedFile, mergeCorrectedIntoRecords } from '../lib/fileParser';
import { db, AuditEntry, UploadSession } from '../lib/db';

interface DataContextType {
  records: any[];
  targets: Record<string, number>;
  auditLog: AuditEntry[];
  uploadHistory: UploadSession[];
  loadMainFile: (buffer: ArrayBuffer, fileName: string, userName: string) => Promise<{ rowCount: number }>;
  loadPaidFile: (buffer: ArrayBuffer, fileName: string, userName: string) => Promise<{ matched: number; total: number }>;
  loadAdditionalFile: (buffer: ArrayBuffer, fileName: string, userName: string) => Promise<{ matched: number; total: number; stats: any }>;
  loadCorrectedFile: (buffer: ArrayBuffer, fileName: string, userName: string) => Promise<{ matched: number; total: number }>;
  updateRecord: (agreementid: string, field: string, value: any, userName: string) => Promise<void>;
  setTarget: (key: string, pct: number, userName: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<any[]>([]);
  const [targets, setTargets] = useState<Record<string, number>>({});
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [uploadHistory, setUploadHistory] = useState<UploadSession[]>([]);

  // Load from Dexie on mount
  useEffect(() => {
    async function loadData() {
      // 1. Migrate legacy localStorage targets if present
      try {
        const savedTargetsStr = localStorage.getItem('app_targets');
        if (savedTargetsStr) {
          const savedTargets = JSON.parse(savedTargetsStr);
          for (const [key, pct] of Object.entries(savedTargets)) {
            // Check if it already exists in Dexie so we don't overwrite newer changes
            const existing = await db.state_targets.get(key);
            if (!existing) {
              await db.state_targets.put({ key, pct: Number(pct), updatedAt: new Date().toISOString() });
            }
          }
          // Intentionally NOT deleting from localStorage, just stop reading it as primary
        }
      } catch (err) {
        console.error("Migration error:", err);
      }

      // 2. Load targets from Dexie
      const dbTargets = await db.state_targets.toArray();
      const targetsMap = dbTargets.reduce((acc, t) => {
        acc[t.key] = t.pct;
        return acc;
      }, {} as Record<string, number>);
      setTargets(targetsMap);

      // 3. Load records
      const dbRecords = await db.loan_records.toArray();
      setRecords(dbRecords);

      // 4. Load history and audit logs
      const dbUploads = await db.upload_sessions.orderBy('createdAt').reverse().toArray();
      setUploadHistory(dbUploads);

      const dbAudit = await db.audit_log.orderBy('createdAt').reverse().toArray();
      setAuditLog(dbAudit);
    }
    loadData();
  }, []);

  const loadMainFile = useCallback(async (buffer: ArrayBuffer, fileName: string, userName: string) => {
    const parsed = parseMainFile(buffer);
    setRecords(parsed);
    const entry = { id: crypto.randomUUID(), type: 'MAIN_DATA', fileName, recordCount: parsed.length, uploadedBy: userName, createdAt: new Date().toISOString() };
    setUploadHistory(prev => [entry, ...prev]);
    
    await db.loan_records.bulkPut(parsed);
    await db.upload_sessions.put(entry);
    
    return { rowCount: parsed.length };
  }, []);

  const loadPaidFile = useCallback(async (buffer: ArrayBuffer, fileName: string, userName: string) => {
    const paidRows = parsePaidFile(buffer);
    let matched = 0;
    let mergedData: any[] = [];
    
    setRecords(prev => {
      mergedData = mergePaidIntoRecords(prev, paidRows);
      matched = paidRows.filter(p => prev.some(r => r.agreementid === p.agreementid)).length;
      return mergedData;
    });
    
    const entry = { id: crypto.randomUUID(), type: 'PAID_FILE', fileName, recordCount: paidRows.length, uploadedBy: userName, createdAt: new Date().toISOString() };
    setUploadHistory(prev => [entry, ...prev]);
    
    // Use bulkPut to update the matched records
    await db.loan_records.bulkPut(mergedData);
    await db.upload_sessions.put(entry);
    
    return { matched, total: paidRows.length }; 
  }, []);

  const loadAdditionalFile = useCallback(async (buffer: ArrayBuffer, fileName: string, userName: string) => {
    const additionalRows = parseAdditionalFile(buffer);
    let matched = 0;
    let finalStats: any = {};
    let mergedData: any[] = [];
    
    setRecords(prev => {
      const { merged, stats } = mergeAdditionalIntoRecords(prev, additionalRows);
      mergedData = merged;
      matched = additionalRows.filter(p => prev.some(r => r.agreementid === p.agreementid)).length;
      finalStats = stats;
      return merged;
    });
    
    const entry = { id: crypto.randomUUID(), type: 'ADDITIONAL_COLLECTION_FILE', fileName, recordCount: additionalRows.length, uploadedBy: userName, createdAt: new Date().toISOString() };
    setUploadHistory(prev => [entry, ...prev]);
    
    await db.loan_records.bulkPut(mergedData);
    await db.upload_sessions.put(entry);
    
    return { matched, total: additionalRows.length, stats: finalStats };
  }, []);

  const loadCorrectedFile = useCallback(async (buffer: ArrayBuffer, fileName: string, userName: string) => {
    const correctedRows = parseCorrectedFile(buffer);
    let matchCount = 0;
    let mergedData: any[] = [];
    
    setRecords(prev => {
      const { merged, matched } = mergeCorrectedIntoRecords(prev, correctedRows);
      mergedData = merged;
      matchCount = matched;
      return merged;
    });
    
    const entry = { id: crypto.randomUUID(), type: 'CORRECTED_DAC_FILE', fileName, recordCount: correctedRows.length, uploadedBy: userName, createdAt: new Date().toISOString() };
    setUploadHistory(prev => [entry, ...prev]);
    
    await db.loan_records.bulkPut(mergedData);
    await db.upload_sessions.put(entry);
    
    return { matched: matchCount, total: correctedRows.length };
  }, []);

  const updateRecord = useCallback(async (agreementid: string, field: string, value: any, userName: string) => {
    let oldVal = '';
    
    setRecords(prev => prev.map(r => {
      if (r.agreementid === agreementid) {
        oldVal = String(r[field] ?? '');
        return { ...r, [field]: value, [`${field}_source`]: 'MANUAL' };
      }
      return r;
    }));
    
    const audit = {
      id: crypto.randomUUID(),
      agreementid,
      field,
      oldValue: oldVal,
      newValue: String(value),
      changedBy: userName,
      createdAt: new Date().toISOString(),
      source: 'MANUAL',
    };
    
    setAuditLog(a => [audit, ...a]);
    
    await db.loan_records.update(agreementid, { [field]: value, [`${field}_source`]: 'MANUAL' });
    await db.audit_log.put(audit);
  }, []);

  const setTarget = useCallback(async (key: string, pct: number, _userName: string) => {
    setTargets(prev => ({ ...prev, [key]: pct }));
    await db.state_targets.put({ key, pct, updatedAt: new Date().toISOString() });
  }, []);

  return (
    <DataContext.Provider value={{ records, targets, auditLog, uploadHistory, loadMainFile, loadPaidFile, loadAdditionalFile, loadCorrectedFile, updateRecord, setTarget }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
};
