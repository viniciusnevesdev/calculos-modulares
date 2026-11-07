import Dexie, { type Table } from 'dexie';
import { isBoard, type Board } from '../domain/boards';

class BoardsDatabase extends Dexie {
  boards!: Table<Board, string>;
  constructor() {
    super('calculos-modulares');
    this.version(1).stores({ boards: 'id, updatedAt, kind' });
  }
}
const db = new BoardsDatabase();
export const storage = {
  async list(): Promise<Board[]> {
    const records = await db.boards.orderBy('updatedAt').reverse().toArray();
    if (!records.every(isBoard)) throw new Error('Há quadros com formato incompatível. Os dados originais foram preservados.');
    return records;
  },
  async put(board: Board) { await db.boards.put(board); },
  async remove(id: string) { await db.boards.delete(id); },
  /** Atomic merge: never overwrite or delete an existing board, even on matching IDs. */
  async importMissing(incoming: Board[]): Promise<{ added: number; skipped: number }> {
    if (!incoming.every(isBoard) || new Set(incoming.map(b => b.id)).size !== incoming.length) {
      throw new Error('Backup com quadros inválidos ou duplicados. Nada foi alterado.');
    }
    return db.transaction('rw', db.boards, async () => {
      const present = await db.boards.bulkGet(incoming.map(board => board.id));
      const missing = incoming.filter((_, index) => present[index] === undefined);
      if (missing.length) await db.boards.bulkAdd(missing);
      return { added: missing.length, skipped: incoming.length - missing.length };
    });
  },
};
