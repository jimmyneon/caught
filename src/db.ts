import Dexie, { type EntityTable } from 'dexie';
import type { CatchRecord } from './types';

export const db = new Dexie('caught') as Dexie & {
  catches: EntityTable<CatchRecord, 'id'>;
};

db.version(1).stores({
  catches: 'id, createdAt, species',
});

// v2: add syncedAt index for sync queue, deleted flag for soft deletes
db.version(2).stores({
  catches: 'id, createdAt, species, syncedAt, deleted',
}).upgrade(async (tx) => {
  // Mark all existing catches as needing sync
  await tx.table('catches').toCollection().modify((c: any) => {
    if (c.syncedAt === undefined) c.syncedAt = 0;
    if (c.deleted === undefined) c.deleted = false;
  });
});
