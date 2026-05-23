import Dexie, { type EntityTable } from 'dexie'

export interface User {
  id?: number
  name: string
  gender: string
  birthDate: string
  bloodType: string
  height: number
  weight: number
  allergies: string[]
  chronicDiseases: string[]
  emergencyContact: string
  familyHistory: string
}

export interface Medication {
  id?: number
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate: string
  reminderEnabled: boolean
  reminderTimes: string[]
  notes: string
  status: 'active' | 'stopped'
}

export interface MedicationLog {
  id?: number
  medicationId: number
  takenAt: string
  skipped: boolean
  notes: string
}

export interface Visit {
  id?: number
  date: string
  hospital: string
  department: string
  doctor: string
  reason: string
  diagnosis: string
  prescription: string
  attachments: Blob[]
}

export interface ReportItem {
  name: string
  value: string
  unit: string
  range: string
  abnormal: boolean
}

export interface HealthReport {
  id?: number
  date: string
  title: string
  hospital: string
  items: ReportItem[]
  attachment?: Blob
}

export interface Symptom {
  id?: number
  date: string
  symptom: string
  severity: number
  duration: string
  triggers: string[]
  notes: string
}

export interface ExportRecord {
  id?: number
  createdAt: string
  dateRange: { from: string; to: string }
  modules: string[]
  format: 'PDF' | 'JSON'
  hasPassword: boolean
}

const db = new Dexie('HealthAssistantDB') as Dexie & {
  users: EntityTable<User, 'id'>
  medications: EntityTable<Medication, 'id'>
  medicationLogs: EntityTable<MedicationLog, 'id'>
  visits: EntityTable<Visit, 'id'>
  reports: EntityTable<HealthReport, 'id'>
  symptoms: EntityTable<Symptom, 'id'>
  exports: EntityTable<ExportRecord, 'id'>
}

db.version(1).stores({
  users: '++id',
  medications: '++id, status',
  medicationLogs: '++id, medicationId, takenAt',
  visits: '++id, date',
  reports: '++id, date',
  symptoms: '++id, date',
  exports: '++id, createdAt',
})

export { db }
