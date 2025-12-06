import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Energy levels for daily alignment
export type EnergyLevel = "low" | "normal" | "high";

// Pillar tracking for weekly overview
export interface Pillar {
  id: string;
  name: string;
  current: number;
  target: number;
}

// Task for Big 3 priorities
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

// Time block for schedule
export interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  activity: string;
}

// Daily alignment data
export interface DailyAlignment {
  id: string;
  date: string;
  verseOfDay: string;
  verseReference: string;
  energyLevel: EnergyLevel;
  bigThree: Task[];
  schedule: TimeBlock[];
}

// Weekly focus data
export interface WeeklyFocus {
  id: string;
  weekStart: string;
  focusStatement: string;
  topFive: string[];
  pillars: Pillar[];
}

// Default pillars
export const defaultPillars: Pillar[] = [
  { id: "1", name: "Faith", current: 2, target: 3 },
  { id: "2", name: "Fitness", current: 3, target: 4 },
  { id: "3", name: "Business", current: 1, target: 3 },
  { id: "4", name: "Real Estate", current: 0, target: 2 },
  { id: "5", name: "Family", current: 4, target: 4 },
  { id: "6", name: "Self Care", current: 0, target: 2 },
];

// Default schedule
export const defaultSchedule: TimeBlock[] = [
  { id: "1", startTime: "08:00", endTime: "08:30", activity: "Devotion + planning" },
  { id: "2", startTime: "08:30", endTime: "09:30", activity: "Deep work" },
  { id: "3", startTime: "10:00", endTime: "11:00", activity: "Fitness / Yoga" },
  { id: "4", startTime: "11:00", endTime: "11:30", activity: "Theodore development" },
  { id: "5", startTime: "13:00", endTime: "13:30", activity: "Reset block" },
];

// Default Big 3 tasks
export const defaultBigThree: Task[] = [
  { id: "1", title: "Deep Work – Bookkeeping client", completed: false, order: 1 },
  { id: "2", title: "Yoga Sculpt prep & workout", completed: false, order: 2 },
  { id: "3", title: "Theodore development time", completed: false, order: 3 },
];

// Default weekly top 5
export const defaultTopFive: string[] = [
  "Close out January books",
  "Film 1 real estate video",
  "2× Yoga Sculpt workouts",
  "3 Theodore learning blocks",
  "Date night",
];

// Default verse
export const defaultVerse = {
  text: "I will instruct you and teach you in the way you should go.",
  reference: "Psalm 32:8",
};
