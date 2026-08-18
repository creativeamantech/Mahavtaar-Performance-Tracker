import Dexie, { Table } from 'dexie';

export interface LoanRecord {
  agreementid: string;
  [key: string]: any;
}

export interface UploadSession {
  id: string;
  type: string;
  fileName: string;
  recordCount: number;
  uploadedBy: string;
  createdAt: string;
}

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

export interface StateTarget {
  key: string;
  pct: number;
  updatedBy?: string;
  updatedAt?: string;
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: string;
  passwordHash: string;
  permissions: { views: string[] };
}

class MahavtaarDB extends Dexie {
  loan_records!: Table<LoanRecord, string>;
  upload_sessions!: Table<UploadSession, string>;
  audit_log!: Table<AuditEntry, string>;
  state_targets!: Table<StateTarget, string>;
  users!: Table<StoredUser, string>;

  constructor() {
    super('mahavtaar_tracker_db');
    this.version(1).stores({
      loan_records: 'agreementid, city, state, bom_bkt, executive_name',
      upload_sessions: 'id, createdAt, type',
      audit_log: 'id, agreementid, createdAt',
      state_targets: 'key',
      users: 'id, email',
    });
  }
}

export const db = new MahavtaarDB();

export async function backupSystemData() {
  const records = await db.loan_records.toArray();
  const sessions = await db.upload_sessions.toArray();
  const audit = await db.audit_log.toArray();
  const targets = await db.state_targets.toArray();
  
  const backup = {
    timestamp: new Date().toISOString(),
    version: 1,
    data: {
      loan_records: records,
      upload_sessions: sessions,
      audit_log: audit,
      state_targets: targets
    }
  };
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mahavtaar_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function resetSystemData() {
  await db.transaction('rw', db.loan_records, db.upload_sessions, db.audit_log, db.state_targets, async () => {
    await db.loan_records.clear();
    await db.upload_sessions.clear();
    await db.audit_log.clear();
    await db.state_targets.clear();
  });
}
