import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { parseMainFile, parsePaidFile, mergePaidIntoRecords, parseAdditionalFile, mergeAdditionalIntoRecords, parseCorrectedFile, mergeCorrectedIntoRecords } from '../lib/fileParser';

export interface AuditEntry {
  id: string;
  agreementid: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  createdAt: string;
  source: string;
}

interface DataContextType {
  records: any[];
  targets: Record<string, number>;
  auditLog: AuditEntry[];
  uploadHistory: { id: string; type: string; fileName: string; recordCount: number; uploadedBy: string; createdAt: string }[];
  loadMainFile: (buffer: ArrayBuffer, fileName: string, userName: string) => { rowCount: number };
  loadPaidFile: (buffer: ArrayBuffer, fileName: string, userName: string) => { matched: number; total: number };
  loadAdditionalFile: (buffer: ArrayBuffer, fileName: string, userName: string) => { matched: number; total: number; stats: any };
  loadCorrectedFile: (buffer: ArrayBuffer, fileName: string, userName: string) => { matched: number; total: number };
  updateRecord: (agreementid: string, field: string, value: any, userName: string) => void;
  setTarget: (key: string, pct: number, userName: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<any[]>([]);
  const [targets, setTargets] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('app_targets');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem('app_targets', JSON.stringify(targets));
  }, [targets]);

  const loadMainFile = useCallback((buffer: ArrayBuffer, fileName: string, userName: string) => {
    const parsed = parseMainFile(buffer);
    setRecords(parsed);
    const entry = { id: crypto.randomUUID(), type: 'MAIN_DATA', fileName, recordCount: parsed.length, uploadedBy: userName, createdAt: new Date().toISOString() };
    setUploadHistory(prev => [entry, ...prev]);
    return { rowCount: parsed.length };
  }, []);

  const loadPaidFile = useCallback((buffer: ArrayBuffer, fileName: string, userName: string) => {
    const paidRows = parsePaidFile(buffer);
    let matched = 0;
    setRecords(prev => {
      const merged = mergePaidIntoRecords(prev, paidRows);
      matched = paidRows.filter(p => prev.some(r => r.agreementid === p.agreementid)).length;
      return merged;
    });
    const entry = { id: crypto.randomUUID(), type: 'PAID_FILE', fileName, recordCount: paidRows.length, uploadedBy: userName, createdAt: new Date().toISOString() };
    setUploadHistory(prev => [entry, ...prev]);
    return { matched, total: paidRows.length }; 
  }, []);

  const loadAdditionalFile = useCallback((buffer: ArrayBuffer, fileName: string, userName: string) => {
    const additionalRows = parseAdditionalFile(buffer);
    let matched = 0;
    let finalStats: any = {};
    setRecords(prev => {
      const { merged, stats } = mergeAdditionalIntoRecords(prev, additionalRows);
      matched = additionalRows.filter(p => prev.some(r => r.agreementid === p.agreementid)).length;
      finalStats = stats;
      return merged;
    });
    const entry = { id: crypto.randomUUID(), type: 'ADDITIONAL_COLLECTION_FILE', fileName, recordCount: additionalRows.length, uploadedBy: userName, createdAt: new Date().toISOString() };
    setUploadHistory(prev => [entry, ...prev]);
    return { matched, total: additionalRows.length, stats: finalStats };
  }, []);

  const loadCorrectedFile = useCallback((buffer: ArrayBuffer, fileName: string, userName: string) => {
    const correctedRows = parseCorrectedFile(buffer);
    let matchCount = 0;
    setRecords(prev => {
      const { merged, matched } = mergeCorrectedIntoRecords(prev, correctedRows);
      matchCount = matched;
      return merged;
    });
    const entry = { id: crypto.randomUUID(), type: 'CORRECTED_DAC_FILE', fileName, recordCount: correctedRows.length, uploadedBy: userName, createdAt: new Date().toISOString() };
    setUploadHistory(prev => [entry, ...prev]);
    return { matched: matchCount, total: correctedRows.length };
  }, []);

  const updateRecord = useCallback((agreementid: string, field: string, value: any, userName: string) => {
    setRecords(prev => prev.map(r => {
      if (r.agreementid === agreementid) {
        const oldValue = String(r[field] ?? '');
        setAuditLog(a => [{
          id: crypto.randomUUID(),
          agreementid,
          field,
          oldValue,
          newValue: String(value),
          changedBy: userName,
          createdAt: new Date().toISOString(),
          source: 'MANUAL',
        }, ...a]);
        return { ...r, [field]: value, [`${field}_source`]: 'MANUAL' };
      }
      return r;
    }));
  }, []);

  const setTarget = useCallback((key: string, pct: number, _userName: string) => {
    setTargets(prev => ({ ...prev, [key]: pct }));
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
