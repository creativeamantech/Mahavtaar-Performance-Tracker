import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { parseMainFile, parsePaidFile, mergePaidIntoRecords, parseAdditionalFile, mergeAdditionalIntoRecords, parseCorrectedFile, mergeCorrectedIntoRecords } from '../lib/fileParser';
import { supabase } from '../lib/supabase';

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

  // We are keeping local state fallback since Supabase requires environment credentials
  // The structure here supports the requested Supabase flow when configured.

  useEffect(() => {
    localStorage.setItem('app_targets', JSON.stringify(targets));
  }, [targets]);

  const loadMainFile = useCallback((buffer: ArrayBuffer, fileName: string, userName: string) => {
    const parsed = parseMainFile(buffer);
    setRecords(parsed);
    const entry = { id: crypto.randomUUID(), type: 'MAIN_DATA', fileName, recordCount: parsed.length, uploadedBy: userName, createdAt: new Date().toISOString() };
    setUploadHistory(prev => [entry, ...prev]);
    
    // Supabase upsert logic (enabled when configured)
    if (import.meta.env.VITE_SUPABASE_URL) {
      supabase.from('loan_records').upsert(parsed, { onConflict: 'agreementid' }).then();
      supabase.from('upload_sessions').insert([entry]).then();
    }
    
    return { rowCount: parsed.length };
  }, []);

  const loadPaidFile = useCallback((buffer: ArrayBuffer, fileName: string, userName: string) => {
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
    
    if (import.meta.env.VITE_SUPABASE_URL) {
      supabase.from('loan_records').upsert(mergedData, { onConflict: 'agreementid' }).then();
      supabase.from('upload_sessions').insert([entry]).then();
    }
    
    return { matched, total: paidRows.length }; 
  }, []);

  const loadAdditionalFile = useCallback((buffer: ArrayBuffer, fileName: string, userName: string) => {
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
    
    if (import.meta.env.VITE_SUPABASE_URL) {
      supabase.from('loan_records').upsert(mergedData, { onConflict: 'agreementid' }).then();
      supabase.from('upload_sessions').insert([entry]).then();
    }
    
    return { matched, total: additionalRows.length, stats: finalStats };
  }, []);

  const loadCorrectedFile = useCallback((buffer: ArrayBuffer, fileName: string, userName: string) => {
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
    
    if (import.meta.env.VITE_SUPABASE_URL) {
      supabase.from('loan_records').upsert(mergedData, { onConflict: 'agreementid' }).then();
      supabase.from('upload_sessions').insert([entry]).then();
    }
    
    return { matched: matchCount, total: correctedRows.length };
  }, []);

  const updateRecord = useCallback((agreementid: string, field: string, value: any, userName: string) => {
    setRecords(prev => prev.map(r => {
      if (r.agreementid === agreementid) {
        const oldValue = String(r[field] ?? '');
        const audit = {
          id: crypto.randomUUID(),
          agreementid,
          field,
          oldValue,
          newValue: String(value),
          changedBy: userName,
          createdAt: new Date().toISOString(),
          source: 'MANUAL',
        };
        setAuditLog(a => [audit, ...a]);
        
        if (import.meta.env.VITE_SUPABASE_URL) {
          supabase.from('loan_records').update({ [field]: value }).eq('agreementid', agreementid).then();
          supabase.from('audit_log').insert([audit]).then();
        }
        
        return { ...r, [field]: value, [`${field}_source`]: 'MANUAL' };
      }
      return r;
    }));
  }, []);

  const setTarget = useCallback((key: string, pct: number, _userName: string) => {
    setTargets(prev => {
      const next = { ...prev, [key]: pct };
      if (import.meta.env.VITE_SUPABASE_URL) {
        supabase.from('state_targets').upsert({ id: key, pct }).then();
      }
      return next;
    });
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
