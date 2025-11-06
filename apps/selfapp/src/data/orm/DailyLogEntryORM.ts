import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Task } from '@/types/task-tracking';

// Corresponds to the DailyLogEntryModel in the frontend
export interface DailyLogEntryModel {
  id?: number;
  date: string;
  goals: string[];
  execution_notes: string | null;
  tasks: Task[] | null;
  focus_rating: number;
  energy_rating: number;
  motivation: number;
  anxiety: number;
  confidence: number;
  difficulties: string | null;
  performance_score: number;
  win_lose: boolean;
  reasoning: string | null;
  improvement_notes: string | null;
  skills: string[] | null;
  strengths: string[] | null;
  scorecard: {
    wins: string[];
    needs_improvement: string;
  };
}

class DailyLogEntryDB extends Dexie {
  public daily_log_entry!: Table<DailyLogEntryModel, number>;

  public constructor() {
    super('DailyLogEntryDB');
    this.version(2).stores({
      daily_log_entry:
        '++id, date, goals, execution_notes, tasks, focus_rating, energy_rating, motivation, anxiety, confidence, difficulties, performance_score, win_lose, reasoning, improvement_notes, skills, strengths, scorecard',
    });
  }
}

const db = new DailyLogEntryDB();

export class DailyLogEntryORM {
  private static instance: DailyLogEntryORM;

  private constructor() {}

  public static getInstance(): DailyLogEntryORM {
    if (!DailyLogEntryORM.instance) {
      DailyLogEntryORM.instance = new DailyLogEntryORM();
    }
    return DailyLogEntryORM.instance;
  }

  async insertDailyLogEntry(entries: DailyLogEntryModel[]): Promise<number[]> {
    const ids = await db.daily_log_entry.bulkAdd(entries, { allKeys: true });
    return ids as number[];
  }

  async getDailyLogEntryByDate(date: string): Promise<DailyLogEntryModel[]> {
    return await db.daily_log_entry.where('date').equals(date).toArray();
  }

  async setDailyLogEntryByDate(
    date: string,
    entry: DailyLogEntryModel
  ): Promise<number> {
    const existing = await this.getDailyLogEntryByDate(date);
    if (existing.length > 0 && existing[0].id) {
      return await db.daily_log_entry.update(existing[0].id, entry);
    } else {
      const newId = await db.daily_log_entry.add(entry);
      return newId as number;
    }
  }

  async getAllDailyLogEntry(): Promise<DailyLogEntryModel[]> {
    return await db.daily_log_entry.toArray();
  }

  async deleteDailyLogEntryByDate(date: string): Promise<void> {
    await db.daily_log_entry.where('date').equals(date).delete();
  }

  async clearAll(): Promise<void> {
    await db.daily_log_entry.clear();
  }
}

export default DailyLogEntryORM;
