import { openDB } from 'idb';

const DATABASE_NAME = 'signify-ai-db';
const DATABASE_VERSION = 1;
const STORE_NAME = 'lectures';

let dbPromise = null;

// Initialize standard IndexedDB
export function initDB() {
  if (!dbPromise) {
    dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true
          });
        }
      }
    });
  }
  return dbPromise;
}

// Save a lecture to the database
export async function saveLecture(lectureData) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  // Auto-generate title from first sentence of transcript if not provided
  let title = lectureData.title;
  if (!title && lectureData.transcript) {
    const cleanTranscript = lectureData.transcript.trim();
    const sentences = cleanTranscript.split(/[.!?]+/);
    if (sentences.length > 0 && sentences[0].trim().length > 0) {
      // Limit title to first 8 words or 60 characters
      const firstSentence = sentences[0].trim();
      const words = firstSentence.split(/\s+/);
      if (words.length > 8) {
        title = words.slice(0, 8).join(' ') + '...';
      } else {
        title = firstSentence;
      }
    } else {
      title = 'Untitled Lecture';
    }
  }

  const newLecture = {
    ...lectureData,
    title: title || 'Untitled Lecture',
    createdAt: lectureData.createdAt || new Date().toISOString(),
    wordCount: lectureData.wordCount || (lectureData.transcript ? lectureData.transcript.split(/\s+/).filter(Boolean).length : 0)
  };

  const id = await store.add(newLecture);
  await tx.done;
  return id;
}

// Retrieve all lectures, sorted by creation date descending
export async function getAllLectures() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const lectures = await store.getAll();
  await tx.done;
  
  // Sort descending by date
  return lectures.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Retrieve a specific lecture by ID
export async function getLecture(id) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const lecture = await store.get(Number(id));
  await tx.done;
  return lecture;
}

// Delete a specific lecture by ID
export async function deleteLecture(id) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.delete(Number(id));
  await tx.done;
}

// Delete all lectures
export async function clearAllLectures() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  await tx.done;
}

// Get storage metrics: total count & approximate size of the data stored
export async function getStorageStats() {
  const lectures = await getAllLectures();
  const count = lectures.length;
  
  // Estimate size of text fields in JSON
  const serialized = JSON.stringify(lectures);
  const bytes = new Blob([serialized]).size;
  const estimatedSizeKB = Math.round(bytes / 1024 * 100) / 100;
  
  return {
    count,
    estimatedSizeKB
  };
}
