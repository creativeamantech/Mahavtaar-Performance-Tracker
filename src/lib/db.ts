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
