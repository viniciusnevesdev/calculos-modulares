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
};
