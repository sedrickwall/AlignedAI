import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Energy levels for daily alignment
export type EnergyLevel = "low" | "normal" | "high";

// Tasks for Big 3 priorities
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  order: integer("order").notNull().default(0),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Time blocks for schedule
export const timeBlocks = pgTable("time_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  startTime: varchar("start_time").notNull(),
  endTime: varchar("end_time").notNull(),
  activity: text("activity").notNull(),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTimeBlockSchema = createInsertSchema(timeBlocks).omit({
  id: true,
  createdAt: true,
});
export type InsertTimeBlock = z.infer<typeof insertTimeBlockSchema>;
export type TimeBlock = typeof timeBlocks.$inferSelect;

// Pillars for weekly tracking
export const pillars = pgTable("pillars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  current: integer("current").notNull().default(0),
  target: integer("target").notNull().default(0),
  weekStart: varchar("week_start").notNull(), // YYYY-MM-DD format (Monday of the week)
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPillarSchema = createInsertSchema(pillars).omit({
  id: true,
  createdAt: true,
});
export type InsertPillar = z.infer<typeof insertPillarSchema>;
export type Pillar = typeof pillars.$inferSelect;

// Daily alignment settings
export const dailyAlignments = pgTable("daily_alignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  energyLevel: varchar("energy_level").notNull().default("normal"),
  verseText: text("verse_text"),
  verseReference: varchar("verse_reference"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDailyAlignmentSchema = createInsertSchema(dailyAlignments).omit({
  id: true,
  createdAt: true,
});
export type InsertDailyAlignment = z.infer<typeof insertDailyAlignmentSchema>;
export type DailyAlignment = typeof dailyAlignments.$inferSelect;

// Weekly focus
export const weeklyFocus = pgTable("weekly_focus", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  weekStart: varchar("week_start").notNull(), // YYYY-MM-DD format (Monday of the week)
  focusStatement: text("focus_statement"),
  topFive: text("top_five").array(), // Array of 5 goals
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWeeklyFocusSchema = createInsertSchema(weeklyFocus).omit({
  id: true,
  createdAt: true,
});
export type InsertWeeklyFocus = z.infer<typeof insertWeeklyFocusSchema>;
export type WeeklyFocus = typeof weeklyFocus.$inferSelect;

// Reflections for weekly review
export const reflections = pgTable("reflections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  weekStart: varchar("week_start").notNull(), // YYYY-MM-DD format
  wins: text("wins"),
  challenges: text("challenges"),
  gratitude: text("gratitude"),
  nextWeekIntention: text("next_week_intention"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReflectionSchema = createInsertSchema(reflections).omit({
  id: true,
  createdAt: true,
});
export type InsertReflection = z.infer<typeof insertReflectionSchema>;
export type Reflection = typeof reflections.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  timeBlocks: many(timeBlocks),
  pillars: many(pillars),
  dailyAlignments: many(dailyAlignments),
  weeklyFocus: many(weeklyFocus),
  reflections: many(reflections),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const timeBlocksRelations = relations(timeBlocks, ({ one }) => ({
  user: one(users, {
    fields: [timeBlocks.userId],
    references: [users.id],
  }),
}));

export const pillarsRelations = relations(pillars, ({ one }) => ({
  user: one(users, {
    fields: [pillars.userId],
    references: [users.id],
  }),
}));

export const dailyAlignmentsRelations = relations(dailyAlignments, ({ one }) => ({
  user: one(users, {
    fields: [dailyAlignments.userId],
    references: [users.id],
  }),
}));

export const weeklyFocusRelations = relations(weeklyFocus, ({ one }) => ({
  user: one(users, {
    fields: [weeklyFocus.userId],
    references: [users.id],
  }),
}));

export const reflectionsRelations = relations(reflections, ({ one }) => ({
  user: one(users, {
    fields: [reflections.userId],
    references: [users.id],
  }),
}));

// Default pillars for new users
export const defaultPillarNames = [
  "Faith",
  "Fitness", 
  "Business",
  "Real Estate",
  "Family",
  "Self Care",
];

// Default schedule for new users
export const defaultScheduleTemplates = [
  { startTime: "08:00", endTime: "08:30", activity: "Devotion + planning" },
  { startTime: "08:30", endTime: "09:30", activity: "Deep work" },
  { startTime: "10:00", endTime: "11:00", activity: "Fitness / Yoga" },
  { startTime: "11:00", endTime: "11:30", activity: "Theodore development" },
  { startTime: "13:00", endTime: "13:30", activity: "Reset block" },
];

// Default Big 3 tasks for new users
export const defaultTaskTemplates = [
  { title: "Deep Work – Priority task", order: 1 },
  { title: "Wellness activity", order: 2 },
  { title: "Personal development", order: 3 },
];

// Default weekly top 5 goals
export const defaultTopFive = [
  "Close out weekly priorities",
  "Complete creative project",
  "2× wellness workouts",
  "3 learning blocks",
  "Quality family time",
];

// Default verse
export const defaultVerse = {
  text: "I will instruct you and teach you in the way you should go.",
  reference: "Psalm 32:8",
};
