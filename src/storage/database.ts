import * as SQLite from 'expo-sqlite';
import { Recording, SortOption, SortOrder } from '../types';
import { DATABASE_NAME } from '../constants';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = SQLite.openDatabase(DATABASE_NAME);
      await this.createTables();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db!.transaction(
        (tx) => {
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS recordings (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              uri TEXT NOT NULL,
              duration INTEGER NOT NULL,
              size INTEGER NOT NULL,
              createdAt TEXT NOT NULL,
              format TEXT NOT NULL,
              category TEXT,
              tags TEXT,
              notes TEXT,
              isFavorite INTEGER DEFAULT 0
            );
          `);
          tx.executeSql(`
            CREATE INDEX IF NOT EXISTS idx_recordings_createdAt ON recordings(createdAt);
          `);
          tx.executeSql(`
            CREATE INDEX IF NOT EXISTS idx_recordings_title ON recordings(title);
          `);
          tx.executeSql(`
            CREATE INDEX IF NOT EXISTS idx_recordings_isFavorite ON recordings(isFavorite);
          `);
        },
        (error) => reject(error),
        () => resolve()
      );
    });
  }

  async saveRecording(recording: Recording): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db!.transaction(
        (tx) => {
          tx.executeSql(
            `INSERT OR REPLACE INTO recordings 
             (id, title, uri, duration, size, createdAt, format, category, tags, notes, isFavorite) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              recording.id,
              recording.title,
              recording.uri,
              recording.duration,
              recording.size,
              recording.createdAt,
              recording.format,
              recording.category || null,
              recording.tags ? JSON.stringify(recording.tags) : null,
              recording.notes || null,
              recording.isFavorite ? 1 : 0,
            ]
          );
        },
        (error) => reject(error),
        () => resolve()
      );
    });
  }

  async getRecording(id: string): Promise<Recording | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM recordings WHERE id = ?',
          [id],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(this.mapToRecording(rows.item(0)));
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getAllRecordings(
    sortBy: SortOption = 'date',
    sortOrder: SortOrder = 'desc'
  ): Promise<Recording[]> {
    if (!this.db) throw new Error('Database not initialized');

    const orderByMap: Record<SortOption, string> = {
      date: 'createdAt',
      name: 'title',
      duration: 'duration',
      size: 'size',
    };

    const orderBy = orderByMap[sortBy];
    const order = sortOrder.toUpperCase();

    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM recordings ORDER BY ${orderBy} ${order}`,
          [],
          (_, { rows }) => {
            const recordings: Recording[] = [];
            for (let i = 0; i < rows.length; i++) {
              recordings.push(this.mapToRecording(rows.item(i)));
            }
            resolve(recordings);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async searchRecordings(query: string): Promise<Recording[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM recordings WHERE title LIKE ? OR notes LIKE ? ORDER BY createdAt DESC',
          [`%${query}%`, `%${query}%`],
          (_, { rows }) => {
            const recordings: Recording[] = [];
            for (let i = 0; i < rows.length; i++) {
              recordings.push(this.mapToRecording(rows.item(i)));
            }
            resolve(recordings);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getRecordingsByCategory(category: string): Promise<Recording[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM recordings WHERE category = ? ORDER BY createdAt DESC',
          [category],
          (_, { rows }) => {
            const recordings: Recording[] = [];
            for (let i = 0; i < rows.length; i++) {
              recordings.push(this.mapToRecording(rows.item(i)));
            }
            resolve(recordings);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getFavoriteRecordings(): Promise<Recording[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM recordings WHERE isFavorite = 1 ORDER BY createdAt DESC',
          [],
          (_, { rows }) => {
            const recordings: Recording[] = [];
            for (let i = 0; i < rows.length; i++) {
              recordings.push(this.mapToRecording(rows.item(i)));
            }
            resolve(recordings);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async updateRecording(recording: Partial<Recording> & { id: string }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    if (recording.title !== undefined) {
      fields.push('title = ?');
      values.push(recording.title);
    }
    if (recording.category !== undefined) {
      fields.push('category = ?');
      values.push(recording.category);
    }
    if (recording.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(recording.tags));
    }
    if (recording.notes !== undefined) {
      fields.push('notes = ?');
      values.push(recording.notes);
    }
    if (recording.isFavorite !== undefined) {
      fields.push('isFavorite = ?');
      values.push(recording.isFavorite ? 1 : 0);
    }

    if (fields.length === 0) return;

    values.push(recording.id);

    return new Promise((resolve, reject) => {
      this.db!.transaction(
        (tx) => {
          tx.executeSql(
            `UPDATE recordings SET ${fields.join(', ')} WHERE id = ?`,
            values
          );
        },
        (error) => reject(error),
        () => resolve()
      );
    });
  }

  async deleteRecording(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db!.transaction(
        (tx) => {
          tx.executeSql('DELETE FROM recordings WHERE id = ?', [id]);
        },
        (error) => reject(error),
        () => resolve()
      );
    });
  }

  async deleteMultipleRecordings(ids: string[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const placeholders = ids.map(() => '?').join(',');

    return new Promise((resolve, reject) => {
      this.db!.transaction(
        (tx) => {
          tx.executeSql(
            `DELETE FROM recordings WHERE id IN (${placeholders})`,
            ids
          );
        },
        (error) => reject(error),
        () => resolve()
      );
    });
  }

  async getCategories(): Promise<string[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        tx.executeSql(
          'SELECT DISTINCT category FROM recordings WHERE category IS NOT NULL ORDER BY category',
          [],
          (_, { rows }) => {
            const categories: string[] = [];
            for (let i = 0; i < rows.length; i++) {
              categories.push(rows.item(i).category);
            }
            resolve(categories);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getStatistics(): Promise<{
    totalRecordings: number;
    totalDuration: number;
    totalSize: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        tx.executeSql(
          'SELECT COUNT(*) as count, SUM(duration) as duration, SUM(size) as size FROM recordings',
          [],
          (_, { rows }) => {
            const result = rows.item(0);
            resolve({
              totalRecordings: result?.count || 0,
              totalDuration: result?.duration || 0,
              totalSize: result?.size || 0,
            });
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  private mapToRecording(row: any): Recording {
    return {
      id: row.id,
      title: row.title,
      uri: row.uri,
      duration: row.duration,
      size: row.size,
      createdAt: row.createdAt,
      format: row.format,
      category: row.category,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      notes: row.notes,
      isFavorite: row.isFavorite === 1,
    };
  }

  async close(): Promise<void> {
    // SQLite.openDatabase doesn't provide a close method in Expo SDK
    this.db = null;
  }
}

export const databaseService = new DatabaseService();
