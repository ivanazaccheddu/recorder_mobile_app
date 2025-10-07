import * as SQLite from 'expo-sqlite';
import { Recording, SortOption, SortOrder } from '../types';
import { DATABASE_NAME } from '../constants';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await this.createTables();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
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

      CREATE INDEX IF NOT EXISTS idx_recordings_createdAt ON recordings(createdAt);
      CREATE INDEX IF NOT EXISTS idx_recordings_title ON recordings(title);
      CREATE INDEX IF NOT EXISTS idx_recordings_isFavorite ON recordings(isFavorite);
    `);
  }

  async saveRecording(recording: Recording): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
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
  }

  async getRecording(id: string): Promise<Recording | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM recordings WHERE id = ?',
      [id]
    );

    return result ? this.mapToRecording(result) : null;
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

    const results = await this.db.getAllAsync<any>(
      `SELECT * FROM recordings ORDER BY ${orderBy} ${order}`
    );

    return results.map(this.mapToRecording);
  }

  async searchRecordings(query: string): Promise<Recording[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM recordings WHERE title LIKE ? OR notes LIKE ? ORDER BY createdAt DESC',
      [`%${query}%`, `%${query}%`]
    );

    return results.map(this.mapToRecording);
  }

  async getRecordingsByCategory(category: string): Promise<Recording[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM recordings WHERE category = ? ORDER BY createdAt DESC',
      [category]
    );

    return results.map(this.mapToRecording);
  }

  async getFavoriteRecordings(): Promise<Recording[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM recordings WHERE isFavorite = 1 ORDER BY createdAt DESC'
    );

    return results.map(this.mapToRecording);
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

    await this.db.runAsync(
      `UPDATE recordings SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async deleteRecording(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM recordings WHERE id = ?', [id]);
  }

  async deleteMultipleRecordings(ids: string[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const placeholders = ids.map(() => '?').join(',');
    await this.db.runAsync(
      `DELETE FROM recordings WHERE id IN (${placeholders})`,
      ids
    );
  }

  async getCategories(): Promise<string[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync<{ category: string }>(
      'SELECT DISTINCT category FROM recordings WHERE category IS NOT NULL ORDER BY category'
    );

    return results.map(r => r.category);
  }

  async getStatistics(): Promise<{
    totalRecordings: number;
    totalDuration: number;
    totalSize: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<any>(
      'SELECT COUNT(*) as count, SUM(duration) as duration, SUM(size) as size FROM recordings'
    );

    return {
      totalRecordings: result?.count || 0,
      totalDuration: result?.duration || 0,
      totalSize: result?.size || 0,
    };
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
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export const databaseService = new DatabaseService();
