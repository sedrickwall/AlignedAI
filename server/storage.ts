import { 
  type User, 
  type InsertUser, 
  type EnergyLevel,
  type Task,
  type TimeBlock,
  type Pillar,
  defaultBigThree,
  defaultSchedule,
  defaultPillars,
  defaultTopFive,
  defaultVerse
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface DailyAlignmentData {
  energyLevel: EnergyLevel;
  tasks: Task[];
  schedule: TimeBlock[];
  verse: { text: string; reference: string };
}

export interface WeeklyData {
  pillars: Pillar[];
  focusStatement: string;
  topFive: string[];
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getDailyAlignment(): Promise<DailyAlignmentData>;
  updateEnergyLevel(level: EnergyLevel): Promise<EnergyLevel>;
  updateTask(taskId: string, completed: boolean): Promise<Task | undefined>;
  
  getWeeklyData(): Promise<WeeklyData>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private energyLevel: EnergyLevel;
  private tasks: Task[];
  private schedule: TimeBlock[];
  private pillars: Pillar[];
  private focusStatement: string;
  private topFive: string[];
  private verse: { text: string; reference: string };

  constructor() {
    this.users = new Map();
    this.energyLevel = "normal";
    this.tasks = [...defaultBigThree];
    this.schedule = [...defaultSchedule];
    this.pillars = [...defaultPillars];
    this.focusStatement = "This week is about consistency in key areas: fitness, bookkeeping, and Theodore development.";
    this.topFive = [...defaultTopFive];
    this.verse = { ...defaultVerse };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getDailyAlignment(): Promise<DailyAlignmentData> {
    return {
      energyLevel: this.energyLevel,
      tasks: this.tasks,
      schedule: this.schedule,
      verse: this.verse,
    };
  }

  async updateEnergyLevel(level: EnergyLevel): Promise<EnergyLevel> {
    this.energyLevel = level;
    return this.energyLevel;
  }

  async updateTask(taskId: string, completed: boolean): Promise<Task | undefined> {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = completed;
      return task;
    }
    return undefined;
  }

  async getWeeklyData(): Promise<WeeklyData> {
    return {
      pillars: this.pillars,
      focusStatement: this.focusStatement,
      topFive: this.topFive,
    };
  }

  async updatePillar(pillarId: string, current: number): Promise<Pillar | undefined> {
    const pillar = this.pillars.find(p => p.id === pillarId);
    if (pillar) {
      pillar.current = current;
      return pillar;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
