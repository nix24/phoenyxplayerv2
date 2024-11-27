import { promises as fs } from 'fs';
import { Database } from 'sqlite3';
import { z } from 'zod';

const dbFile = 'player.db';

// Zod schemas for type safety
const SongSchema = z.object({
    img: z.string(),
    songName: z.string(),
    artistName: z.string(),
    tags: z.array(z.string()),
});

export type Song = z.infer<typeof SongSchema>;


export async function connect(): Promise<Database> {
    const db = new Database(dbFile);
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS songs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                img TEXT,
                songName TEXT,
                artistName TEXT,
                tags TEXT
            )`, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(db);
              }
        });
      });
    });
  }


export async function createSchema() {
  try {
      await fs.access(dbFile);
      console.log('Database file already exists. Skipping creation.');
      return;
  } catch (err) {
        // File doesn't exist, proceed with creation
        console.log('Database file does not exist. Creating it...');
        await fs.writeFile(dbFile, '');
        console.log('Database file created successfully.');
  }
  const db = await connect();

  return new Promise<void>((resolve, reject) => {
    db.run(`CREATE TABLE IF NOT EXISTS songs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            img TEXT,
            songName TEXT,
            artistName TEXT,
            tags TEXT
        )`, (err) => {
        if (err) {
            reject(err);
        } else {
            console.log('Table "songs" created successfully.');
            resolve();
        }
        db.close();
    });
  });
}