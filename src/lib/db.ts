import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
  synced: boolean;
  deleted?: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  priority: Priority;
  folderId?: string;
  createdAt: number;
  updatedAt: number;
  synced: boolean;
  deleted?: boolean;
}

export interface NoteImage {
  id: string;
  noteId: string;
  blob: Blob;
  name: string;
  createdAt: number;
}

interface NotesDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: { 'by-updated': number };
  };
  folders: {
    key: string;
    value: Folder;
    indexes: { 'by-name': string };
  };
  images: {
    key: string;
    value: NoteImage;
    indexes: { 'by-noteId': string };
  };
}

let dbInstance: IDBPDatabase<NotesDB> | null = null;

export async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<NotesDB>('notes-db', 3, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
        noteStore.createIndex('by-updated', 'updatedAt');
      }
      if (oldVersion < 2) {
        const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
        folderStore.createIndex('by-name', 'name');
      }
      if (oldVersion < 3) {
        const imageStore = db.createObjectStore('images', { keyPath: 'id' });
        imageStore.createIndex('by-noteId', 'noteId');
      }
    },
  });

  return dbInstance;
}

export async function getAllNotes(): Promise<Note[]> {
  const db = await getDB();
  const notes = await db.getAllFromIndex('notes', 'by-updated');
  return notes
    .filter(note => !note.deleted)
    .map(note => ({ ...note, priority: (note.priority || 'medium') as Priority }))
    .reverse();
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

// Folder operations
export async function getAllFolders(): Promise<Folder[]> {
  const db = await getDB();
  const folders = await db.getAllFromIndex('folders', 'by-name');
  return folders.filter(folder => !folder.deleted);
}

export async function getFolder(id: string): Promise<Folder | undefined> {
  const db = await getDB();
  return db.get('folders', id);
}

export async function saveFolder(folder: Folder): Promise<void> {
  const db = await getDB();
  await db.put('folders', folder);
}

export async function deleteFolder(id: string): Promise<void> {
  const db = await getDB();
  const folder = await getFolder(id);
  if (folder) {
    await db.put('folders', { ...folder, deleted: true });
  }
}

export async function getNotesByFolder(folderId?: string): Promise<Note[]> {
  const db = await getDB();
  const allNotes = await db.getAllFromIndex('notes', 'by-updated');
  return allNotes
    .filter(note => !note.deleted && note.folderId === folderId)
    .map(note => ({ ...note, priority: (note.priority || 'medium') as Priority }))
    .reverse();
}

// Image operations
export async function saveImage(image: NoteImage): Promise<void> {
  const db = await getDB();
  await db.put('images', image);
}

export async function getImage(id: string): Promise<NoteImage | undefined> {
  const db = await getDB();
  return db.get('images', id);
}

export async function getImagesByNote(noteId: string): Promise<NoteImage[]> {
  const db = await getDB();
  return db.getAllFromIndex('images', 'by-noteId', noteId);
}

export async function deleteImage(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('images', id);
}

export async function deleteImagesByNote(noteId: string): Promise<void> {
  const db = await getDB();
  const images = await getImagesByNote(noteId);
  await Promise.all(images.map(img => db.delete('images', img.id)));
}
