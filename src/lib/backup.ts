import {
  getAllNotesIncludingDeleted,
  getAllFolders,
  getAllImages,
  saveNote,
  saveFolder,
  saveImage,
  clearAllData,
  Note,
  Folder,
  NoteImage,
} from './db';

const BACKUP_VERSION = 1;

interface BackupImage {
  id: string;
  noteId: string;
  name: string;
  createdAt: number;
  dataUrl: string;
}

interface BackupFile {
  version: number;
  exportedAt: number;
  notes: Note[];
  folders: Folder[];
  images: BackupImage[];
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export async function exportBackup(): Promise<void> {
  const [notes, folders, images] = await Promise.all([
    getAllNotesIncludingDeleted(),
    getAllFolders(),
    getAllImages(),
  ]);

  const backupImages: BackupImage[] = await Promise.all(
    images.map(async (img) => ({
      id: img.id,
      noteId: img.noteId,
      name: img.name,
      createdAt: img.createdAt,
      dataUrl: await blobToDataUrl(img.blob),
    }))
  );

  const backup: BackupFile = {
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    notes,
    folders,
    images: backupImages,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `caderno-escolar-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export type ImportMode = 'merge' | 'replace';

export interface ImportResult {
  notes: number;
  folders: number;
  images: number;
}

export async function importBackup(file: File, mode: ImportMode): Promise<ImportResult> {
  const text = await file.text();
  let data: BackupFile;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Arquivo inválido (JSON malformado).');
  }

  if (
    !data ||
    typeof data.version !== 'number' ||
    !Array.isArray(data.notes) ||
    !Array.isArray(data.folders) ||
    !Array.isArray(data.images)
  ) {
    throw new Error('Estrutura de backup inválida.');
  }

  if (mode === 'replace') {
    await clearAllData();
  }

  await Promise.all(data.folders.map((f) => saveFolder(f)));
  await Promise.all(data.notes.map((n) => saveNote(n)));
  await Promise.all(
    data.images.map(async (img) => {
      const blob = await dataUrlToBlob(img.dataUrl);
      const noteImage: NoteImage = {
        id: img.id,
        noteId: img.noteId,
        name: img.name,
        createdAt: img.createdAt,
        blob,
      };
      await saveImage(noteImage);
    })
  );

  return {
    notes: data.notes.length,
    folders: data.folders.length,
    images: data.images.length,
  };
}