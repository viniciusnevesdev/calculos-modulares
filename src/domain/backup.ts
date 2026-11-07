import { isBoard, type Board } from './boards';

export const BACKUP_FORMAT = 'calculos-modulares-backup' as const;
export const BACKUP_VERSION = 1 as const;
export const MAX_BACKUP_BYTES = 20 * 1024 * 1024;

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  boards: Board[];
}

/** Export all local boards without modifying them or changing their IDs. */
export function makeBackup(boards: Board[], now = new Date().toISOString()): BackupFile {
  if (!Array.isArray(boards) || !boards.every(isBoard)) {
    throw new Error('Há quadros incompatíveis. O backup não foi criado.');
  }
  if (new Set(boards.map(board => board.id)).size !== boards.length) {
    throw new Error('Existem quadros com identificadores repetidos.');
  }
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: now, boards };
}

/** Validate the entire file before attempting any database modification. */
export function parseBackup(raw: string): BackupFile {
  let value: unknown;
  try { value = JSON.parse(raw); }
  catch { throw new Error('O arquivo não é um JSON válido.'); }
  if (!value || typeof value !== 'object') {
    throw new Error('Arquivo de backup incompatível.');
  }
  const doc = value as Record<string, unknown>;
  if (doc.format !== BACKUP_FORMAT) throw new Error('Este arquivo não é um backup do Cálculos Modulares.');
  if (doc.version !== BACKUP_VERSION) throw new Error('Esta versão de backup não é compatível com o aplicativo.');
  if (typeof doc.exportedAt !== 'string' || !Number.isFinite(Date.parse(doc.exportedAt))) {
    throw new Error('O backup não contém uma data de exportação válida.');
  }
  if (!Array.isArray(doc.boards) || !doc.boards.every(isBoard)) {
    throw new Error('O backup contém quadros inválidos ou incompatíveis. Nada foi importado.');
  }
  const ids = doc.boards.map(board => board.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error('O backup contém IDs de quadros repetidos. Nada foi importado.');
  }
  return doc as unknown as BackupFile;
}

export function backupFilename(date = new Date()): string {
  const local = [date.getFullYear(),String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')].join('-');
  return 'CalculosModulares_Backup_' + local + '.json';
}
