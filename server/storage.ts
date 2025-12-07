import {
  users,
  tasks,
  timeBlocks,
  pillars,
  dailyAlignments,
  weeklyFocus,
  reflections,
  type User,
  type UpsertUser,
  type Task,
  type InsertTask,
  type TimeBlock,
  type InsertTimeBlock,
  type Pillar,
  type InsertPillar,
  type DailyAlignment,
  type InsertDailyAlignment,
  type WeeklyFocus,
  type InsertWeeklyFocus,
  type Reflection,
  type InsertReflection,
  type EnergyLevel,
  defaultPillarNames,
  defaultScheduleTemplates,
  defaultTaskTemplates,
  defaultTopFive,
  defaultVerse,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, asc, desc } from "drizzle-orm";

// Helper to get current date in YYYY-MM-DD format
export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

// Helper to get Monday of current week in YYYY-MM-DD format
export function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Task operations
  getTasks(userId: string, date: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Time block operations
  getTimeBlocks(userId: string, date: string): Promise<TimeBlock[]>;
  createTimeBlock(block: InsertTimeBlock): Promise<TimeBlock>;
  updateTimeBlock(id: string, updates: Partial<TimeBlock>): Promise<TimeBlock | undefined>;
  deleteTimeBlock(id: string): Promise<boolean>;

  // Pillar operations
  getPillars(userId: string, weekStart: string): Promise<Pillar[]>;
  createPillar(pillar: InsertPillar): Promise<Pillar>;
  updatePillar(id: string, updates: Partial<Pillar>): Promise<Pillar | undefined>;

  // Daily alignment operations
  getDailyAlignment(userId: string, date: string): Promise<DailyAlignment | undefined>;
  upsertDailyAlignment(alignment: InsertDailyAlignment): Promise<DailyAlignment>;

  // Weekly focus operations
  getWeeklyFocus(userId: string, weekStart: string): Promise<WeeklyFocus | undefined>;
  upsertWeeklyFocus(focus: InsertWeeklyFocus): Promise<WeeklyFocus>;

  // Reflection operations
  getReflection(userId: string, weekStart: string): Promise<Reflection | undefined>;
  upsertReflection(reflection: InsertReflection): Promise<Reflection>;

  // Initialize defaults for new user
  initializeUserDefaults(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Task operations
  async getTasks(userId: string, date: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.date, date)))
      .orderBy(asc(tasks.order));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const [updated] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }

  // Time block operations
  async getTimeBlocks(userId: string, date: string): Promise<TimeBlock[]> {
    return await db
      .select()
      .from(timeBlocks)
      .where(and(eq(timeBlocks.userId, userId), eq(timeBlocks.date, date)))
      .orderBy(asc(timeBlocks.startTime));
  }

  async createTimeBlock(block: InsertTimeBlock): Promise<TimeBlock> {
    const [newBlock] = await db.insert(timeBlocks).values(block).returning();
    return newBlock;
  }

  async updateTimeBlock(id: string, updates: Partial<TimeBlock>): Promise<TimeBlock | undefined> {
    const [updated] = await db
      .update(timeBlocks)
      .set(updates)
      .where(eq(timeBlocks.id, id))
      .returning();
    return updated;
  }

  async deleteTimeBlock(id: string): Promise<boolean> {
    const result = await db.delete(timeBlocks).where(eq(timeBlocks.id, id)).returning();
    return result.length > 0;
  }

  // Pillar operations
  async getPillars(userId: string, weekStart: string): Promise<Pillar[]> {
    return await db
      .select()
      .from(pillars)
      .where(and(eq(pillars.userId, userId), eq(pillars.weekStart, weekStart)));
  }

  async createPillar(pillar: InsertPillar): Promise<Pillar> {
    const [newPillar] = await db.insert(pillars).values(pillar).returning();
    return newPillar;
  }

  async updatePillar(id: string, updates: Partial<Pillar>): Promise<Pillar | undefined> {
    const [updated] = await db
      .update(pillars)
      .set(updates)
      .where(eq(pillars.id, id))
      .returning();
    return updated;
  }

  // Daily alignment operations
  async getDailyAlignment(userId: string, date: string): Promise<DailyAlignment | undefined> {
    const [alignment] = await db
      .select()
      .from(dailyAlignments)
      .where(and(eq(dailyAlignments.userId, userId), eq(dailyAlignments.date, date)));
    return alignment;
  }

  async upsertDailyAlignment(alignment: InsertDailyAlignment): Promise<DailyAlignment> {
    // Check if exists
    const existing = await this.getDailyAlignment(alignment.userId, alignment.date);
    if (existing) {
      const [updated] = await db
        .update(dailyAlignments)
        .set(alignment)
        .where(eq(dailyAlignments.id, existing.id))
        .returning();
      return updated;
    }
    const [newAlignment] = await db.insert(dailyAlignments).values(alignment).returning();
    return newAlignment;
  }

  // Weekly focus operations
  async getWeeklyFocus(userId: string, weekStart: string): Promise<WeeklyFocus | undefined> {
    const [focus] = await db
      .select()
      .from(weeklyFocus)
      .where(and(eq(weeklyFocus.userId, userId), eq(weeklyFocus.weekStart, weekStart)));
    return focus;
  }

  async upsertWeeklyFocus(focus: InsertWeeklyFocus): Promise<WeeklyFocus> {
    const existing = await this.getWeeklyFocus(focus.userId, focus.weekStart);
    if (existing) {
      const [updated] = await db
        .update(weeklyFocus)
        .set(focus)
        .where(eq(weeklyFocus.id, existing.id))
        .returning();
      return updated;
    }
    const [newFocus] = await db.insert(weeklyFocus).values(focus).returning();
    return newFocus;
  }

  // Reflection operations
  async getReflection(userId: string, weekStart: string): Promise<Reflection | undefined> {
    const [reflection] = await db
      .select()
      .from(reflections)
      .where(and(eq(reflections.userId, userId), eq(reflections.weekStart, weekStart)));
    return reflection;
  }

  async upsertReflection(reflection: InsertReflection): Promise<Reflection> {
    const existing = await this.getReflection(reflection.userId, reflection.weekStart);
    if (existing) {
      const [updated] = await db
        .update(reflections)
        .set(reflection)
        .where(eq(reflections.id, existing.id))
        .returning();
      return updated;
    }
    const [newReflection] = await db.insert(reflections).values(reflection).returning();
    return newReflection;
  }

  // Initialize defaults for new user
  async initializeUserDefaults(userId: string): Promise<void> {
    const today = getToday();
    const weekStart = getWeekStart();

    // Check if user already has data for today
    const existingTasks = await this.getTasks(userId, today);
    if (existingTasks.length === 0) {
      // Create default tasks
      for (const template of defaultTaskTemplates) {
        await this.createTask({
          userId,
          title: template.title,
          order: template.order,
          date: today,
          completed: false,
        });
      }
    }

    // Check if user already has time blocks for today
    const existingBlocks = await this.getTimeBlocks(userId, today);
    if (existingBlocks.length === 0) {
      // Create default time blocks
      for (const template of defaultScheduleTemplates) {
        await this.createTimeBlock({
          userId,
          startTime: template.startTime,
          endTime: template.endTime,
          activity: template.activity,
          date: today,
        });
      }
    }

    // Check if user already has pillars for this week
    const existingPillars = await this.getPillars(userId, weekStart);
    if (existingPillars.length === 0) {
      // Create default pillars with default targets
      const defaultTargets = [3, 4, 3, 2, 4, 2]; // Faith, Fitness, Business, Real Estate, Family, Self Care
      for (let i = 0; i < defaultPillarNames.length; i++) {
        await this.createPillar({
          userId,
          name: defaultPillarNames[i],
          current: 0,
          target: defaultTargets[i],
          weekStart,
        });
      }
    }

    // Check if user already has daily alignment for today
    const existingAlignment = await this.getDailyAlignment(userId, today);
    if (!existingAlignment) {
      await this.upsertDailyAlignment({
        userId,
        date: today,
        energyLevel: "normal",
        verseText: defaultVerse.text,
        verseReference: defaultVerse.reference,
      });
    }

    // Check if user already has weekly focus for this week
    const existingFocus = await this.getWeeklyFocus(userId, weekStart);
    if (!existingFocus) {
      await this.upsertWeeklyFocus({
        userId,
        weekStart,
        focusStatement: "This week is about consistency in key areas and staying aligned with your calling.",
        topFive: defaultTopFive,
      });
    }
  }
}

export const storage = new DatabaseStorage();
