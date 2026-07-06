import Dexie, { type EntityTable } from 'dexie';
import type { CatchRecord } from './types';

export const db = new Dexie('caught') as Dexie & {
  catches: EntityTable<CatchRecord, 'id'>;
};

db.version(1).stores({
  catches: 'id, createdAt, species',
});

// Diagnostic: log database state
db.on('ready', () => {
  console.log('[db] Database ready');
});

db.on('populate', () => {
  console.log('[db] Database populated (first run)');
});

// If database has an issue, log it clearly
db.on('versionchange', () => {
  console.warn('[db] Version change detected — database may need to reload');
});

// Handle open errors
db.open().catch((err) => {
  console.error('[db] Failed to open database:', err);
  // If the database is corrupted, try to recover by deleting and recreating
  if (err?.name === 'UpgradeError' || err?.name === 'NotFoundError' || err?.name === 'InvalidStateError') {
    console.warn('[db] Attempting database recovery...');
    Dexie.delete('caught').then(() => {
      db.version(1).stores({ catches: 'id, createdAt, species' });
      return db.open();
    }).then(() => console.log('[db] Database recovered')).catch((e) => console.error('[db] Recovery failed:', e));
  }
});
