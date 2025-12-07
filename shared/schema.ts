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

// User Identity Profile (Step 1 of onboarding)
export const identityProfiles = pgTable("identity_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  gifts: text("gifts").array(), // God-given abilities
  skills: text("skills").array(), // Developed through practice
  interests: text("interests").array(), // What lights you up
  passions: text("passions").array(), // What grabs your heart
  strongestTalent: text("strongest_talent"), // Gift + Skill combination
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIdentityProfileSchema = createInsertSchema(identityProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertIdentityProfile = z.infer<typeof insertIdentityProfileSchema>;
export type IdentityProfile = typeof identityProfiles.$inferSelect;

// User Purpose Profile (Step 2 of onboarding)
export const purposeProfiles = pgTable("purpose_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  whoToBlessing: text("who_to_bless").array(), // Who they want to serve
  generosityTargets: jsonb("generosity_targets"), // Those they love, strangers, community, kingdom
  purposeStatement: text("purpose_statement"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPurposeProfileSchema = createInsertSchema(purposeProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPurposeProfile = z.infer<typeof insertPurposeProfileSchema>;
export type PurposeProfile = typeof purposeProfiles.$inferSelect;

// User Season Pillars (Step 3 of onboarding) - customized pillars for this season
export const seasonPillars = pgTable("season_pillars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  weeklyHoursBudget: integer("weekly_hours_budget"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSeasonPillarSchema = createInsertSchema(seasonPillars).omit({
  id: true,
  createdAt: true,
});
export type InsertSeasonPillar = z.infer<typeof insertSeasonPillarSchema>;
export type SeasonPillar = typeof seasonPillars.$inferSelect;

// User Vision Map (Step 4 of onboarding)
export const visionMaps = pgTable("vision_maps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  yearVision: text("year_vision"), // User's vision for the year
  quarterlyOutcomes: jsonb("quarterly_outcomes"), // Q1, Q2, Q3, Q4 outcomes
  monthlyThemes: jsonb("monthly_themes"), // 12 monthly themes
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVisionMapSchema = createInsertSchema(visionMaps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVisionMap = z.infer<typeof insertVisionMapSchema>;
export type VisionMap = typeof visionMaps.$inferSelect;

// User Capacity Profile (Step 5 of onboarding)
export const capacityProfiles = pgTable("capacity_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  energyWindows: jsonb("energy_windows"), // Peak hours, drain times
  fixedRoutines: jsonb("fixed_routines"), // Non-negotiable commitments
  weeklyAvailableHours: integer("weekly_available_hours"),
  emotionalBandwidth: varchar("emotional_bandwidth"), // high, medium, low
  seasonOfLife: text("season_of_life"), // Description of current season
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCapacityProfileSchema = createInsertSchema(capacityProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCapacityProfile = z.infer<typeof insertCapacityProfileSchema>;
export type CapacityProfile = typeof capacityProfiles.$inferSelect;

// Monetization Recommendations (AI-generated)
export const monetizationRecommendations = pgTable("monetization_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  primaryPath: text("primary_path").notNull(),
  rationale: jsonb("rationale"), // Why this path (gift/skill/impact/effort scores)
  monthPlans: jsonb("month_plans"), // 90-day plan: month1, month2, month3
  weeklyActions: jsonb("weekly_actions"), // 5-7 revenue tasks per week
  secondaryOpportunities: text("secondary_opportunities").array(),
  deferredItems: text("deferred_items").array(),
  encouragement: text("encouragement"), // Kingdom-based encouragement
  quarter: varchar("quarter").notNull(), // Q1, Q2, Q3, Q4
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMonetizationRecommendationSchema = createInsertSchema(monetizationRecommendations).omit({
  id: true,
  createdAt: true,
});
export type InsertMonetizationRecommendation = z.infer<typeof insertMonetizationRecommendationSchema>;
export type MonetizationRecommendation = typeof monetizationRecommendations.$inferSelect;

// Task AI Assessments (for task discernment engine)
export const taskAssessments = pgTable("task_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pillarAlignment: text("pillar_alignment"), // Which pillar it supports
  monetizationAlignment: boolean("monetization_alignment"),
  purposeAlignment: boolean("purpose_alignment"),
  impactScore: integer("impact_score"), // 0-10
  effortScore: integer("effort_score"), // 0-10
  energyRequirement: varchar("energy_requirement"), // high-brain, low-brain
  decision: varchar("decision").notNull(), // do_today, do_this_week, next_week, backlog, assign, reject
  bestTimeSlot: varchar("best_time_slot"),
  assignTo: text("assign_to"),
  peaceCheck: varchar("peace_check"), // aligned, stressed, unclear
  reasoning: text("reasoning"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskAssessmentSchema = createInsertSchema(taskAssessments).omit({
  id: true,
  createdAt: true,
});
export type InsertTaskAssessment = z.infer<typeof insertTaskAssessmentSchema>;
export type TaskAssessment = typeof taskAssessments.$inferSelect;

// Onboarding Progress tracking
export const onboardingProgress = pgTable("onboarding_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  currentStep: integer("current_step").notNull().default(1), // 1-5
  identityComplete: boolean("identity_complete").notNull().default(false),
  purposeComplete: boolean("purpose_complete").notNull().default(false),
  pillarsComplete: boolean("pillars_complete").notNull().default(false),
  visionComplete: boolean("vision_complete").notNull().default(false),
  capacityComplete: boolean("capacity_complete").notNull().default(false),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOnboardingProgressSchema = createInsertSchema(onboardingProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertOnboardingProgress = z.infer<typeof insertOnboardingProgressSchema>;
export type OnboardingProgress = typeof onboardingProgress.$inferSelect;

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
export const usersRelations = relations(users, ({ many, one }) => ({
  tasks: many(tasks),
  timeBlocks: many(timeBlocks),
  pillars: many(pillars),
  dailyAlignments: many(dailyAlignments),
  weeklyFocus: many(weeklyFocus),
  reflections: many(reflections),
  identityProfile: one(identityProfiles),
  purposeProfile: one(purposeProfiles),
  seasonPillars: many(seasonPillars),
  visionMaps: many(visionMaps),
  capacityProfile: one(capacityProfiles),
  monetizationRecommendations: many(monetizationRecommendations),
  taskAssessments: many(taskAssessments),
  onboardingProgress: one(onboardingProgress),
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
