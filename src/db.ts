import Dexie, { type EntityTable } from 'dexie';
import type { CatchRecord } from './types';

export const db = new Dexie('caught') as Dexie & {
  catches: EntityTable<CatchRecord, 'id'>;
};

db.version(1).stores({
  catches: 'id, createdAt, species',
});

// Ensure the database is opened immediately and stays open
db.open().catch((err) => console.error('Failed to open database:', err));
