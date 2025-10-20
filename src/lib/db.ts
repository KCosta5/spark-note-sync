import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Note {
  id: string;
  title: string;
  content: string;
  priority: Priority;
  createdAt: number;
  updatedAt: number;
  synced: boolean;
  deleted?: boolean;
}

interface NotesDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: { 'by-updated': number };
  };
}

let dbInstance: IDBPDatabase<NotesDB> | null = null;

export async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<NotesDB>('notes-db', 1, {
    upgrade(db) {
      const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
      noteStore.createIndex('by-updated', 'updatedAt');
    },
  });

  return dbInstance;
}

export async function getAllNotes(): Promise<Note[]> {
  const db = await getDB();
  const notes = await db.getAllFromIndex('notes', 'by-updated');
  return notes.filter(note => !note.deleted).reverse();
}

export async function getNote(id: string): Promise<Note | undefined> {
  const db = await getDB();
  return db.get('notes', id);
}

export async function saveNote(note: Note): Promise<void> {
  const db = await getDB();
  await db.put('notes', note);
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB();
  const note = await getNote(id);
  if (note) {
    await db.put('notes', { ...note, deleted: true, synced: false, updatedAt: Date.now() });
  }
}

export async function getUnsyncedNotes(): Promise<Note[]> {
  const db = await getDB();
  const allNotes = await db.getAll('notes');
  return allNotes.filter(note => !note.synced);
}

export async function markAsSynced(id: string): Promise<void> {
  const db = await getDB();
  const note = await getNote(id);
  if (note) {
    await db.put('notes', { ...note, synced: true });
  }
}
