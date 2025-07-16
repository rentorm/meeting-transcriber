import sqlite3 from 'sqlite3';
import { Session, Transcript } from './types';

export class Database {
  private db: sqlite3.Database;

  constructor(dbPath: string = './meetings.db') {
    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  private init(): void {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          startTime DATETIME NOT NULL,
          endTime DATETIME,
          participants TEXT
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS transcripts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sessionId INTEGER NOT NULL,
          timestamp DATETIME NOT NULL,
          speaker TEXT NOT NULL,
          text TEXT NOT NULL,
          confidence REAL,
          FOREIGN KEY (sessionId) REFERENCES sessions (id)
        )
      `);

      // Create index for better query performance
      this.db.run(`
        CREATE INDEX IF NOT EXISTS idx_transcripts_session 
        ON transcripts(sessionId, timestamp)
      `);
    });
  }

  createSession(name: string, participants?: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare('INSERT INTO sessions (name, startTime, participants) VALUES (?, ?, ?)');
      stmt.run(name, new Date().toISOString(), participants, function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      stmt.finalize();
    });
  }

  endSession(sessionId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare('UPDATE sessions SET endTime = ? WHERE id = ?');
      stmt.run(new Date().toISOString(), sessionId, (err) => {
        if (err) reject(err);
        else resolve();
      });
      stmt.finalize();
    });
  }

  addTranscript(sessionId: number, speaker: string, text: string, confidence?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(
        'INSERT INTO transcripts (sessionId, timestamp, speaker, text, confidence) VALUES (?, ?, ?, ?, ?)'
      );
      stmt.run(sessionId, new Date().toISOString(), speaker, text, confidence, (err) => {
        if (err) reject(err);
        else resolve();
      });
      stmt.finalize();
    });
  }

  getSessions(): Promise<Session[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM sessions ORDER BY startTime DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows as Session[]);
      });
    });
  }

  getTranscripts(sessionId: number): Promise<Transcript[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM transcripts WHERE sessionId = ? ORDER BY timestamp', 
        [sessionId], 
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows as Transcript[]);
        }
      );
    });
  }

  searchTranscripts(query: string): Promise<Transcript[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM transcripts WHERE text LIKE ? ORDER BY timestamp',
        [`%${query}%`],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows as Transcript[]);
        }
      );
    });
  }

  exportSession(sessionId: number, format: 'json' | 'txt' | 'srt'): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const transcripts = await this.getTranscripts(sessionId);
        const session = await this.getSession(sessionId);
        
        switch (format) {
          case 'json':
            resolve(JSON.stringify({ session, transcripts }, null, 2));
            break;
          
          case 'txt':
            let txt = `Meeting: ${session.name}\n`;
            txt += `Date: ${new Date(session.startTime).toLocaleString()}\n`;
            txt += `Participants: ${session.participants || 'N/A'}\n\n`;
            txt += transcripts.map(t => 
              `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.speaker}: ${t.text}`
            ).join('\n');
            resolve(txt);
            break;
          
          case 'srt':
            let srt = '';
            transcripts.forEach((t, i) => {
              const start = new Date(t.timestamp);
              const end = transcripts[i + 1] 
                ? new Date(transcripts[i + 1].timestamp)
                : new Date(start.getTime() + 5000);
              
              srt += `${i + 1}\n`;
              srt += `${this.formatSRTTime(start)} --> ${this.formatSRTTime(end)}\n`;
              srt += `${t.speaker}: ${t.text}\n\n`;
            });
            resolve(srt);
            break;
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  private formatSRTTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds},${ms}`;
  }

  private getSession(sessionId: number): Promise<Session> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM sessions WHERE id = ?', [sessionId], (err, row) => {
        if (err) reject(err);
        else resolve(row as Session);
      });
    });
  }

  close(): void {
    this.db.close();
  }
}