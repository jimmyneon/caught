import Dexie, { type EntityTable } from 'dexie';
import type { CatchRecord } from './types';

export const db = new Dexie('caught') as Dexie & {
  catches: EntityTable<CatchRecord, 'id'>;
};

db.version(1).stores({
  catches: 'id, createdAt, species',
});
