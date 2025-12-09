import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, getToday, getWeekStart } from "./storage";
import { setupAuth } from "./replitAuth";
import { firebaseAuth } from "./firebaseAuth";
import { getAIPrioritization, generateMonetizationPlan, evaluateTask } from "./ai";
import { z } from "zod";
import type { EnergyLevel } from "@shared/schema";

// Onboarding schemas
const identityProfileSchema = z.object({
  gifts: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  passions: z.array(z.string()).optional(),
  strongestTalent: z.string().optional(),
});

const purposeProfileSchema = z.object({
  whoToBlessing: z.array(z.string()).optional(),
  generosityTargets: z.any().optional(),
  purposeStatement: z.string().optional(),
});

const seasonPillarSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
  weeklyHoursBudget: z.number().optional(),
});

const visionMapSchema = z.object({
  yearVision: z.string().optional(),
  quarterlyOutcomes: z.any().optional(),
  monthlyThemes: z.any().optional(),
  year: z.number(),
});

const capacityProfileSchema = z.object({
  energyWindows: z.any().optional(),
  fixedRoutines: z.any().optional(),
  weeklyAvailableHours: z.number().optional(),
  emotionalBandwidth: z.string().optional(),
  seasonOfLife: z.string().optional(),
});

const onboardingProgressSchema = z.object({
  currentStep: z.number().optional(),
  identityComplete: z.boolean().optional(),
  purposeComplete: z.boolean().optional(),
  pillarsComplete: z.boolean().optional(),
  visionComplete: z.boolean().optional(),
  capacityComplete: z.boolean().optional(),
  onboardingComplete: z.boolean().optional(),
});

const energyLevelSchema = z.enum(["low", "normal", "high"]);

const updateTaskSchema = z.object({
  title: z.string().optional(),
  completed: z.boolean().optional(),
  order: z.number().optional(),
});

const createTaskSchema = z.object({
  title: z.string().min(1),
  order: z.number().optional(),
});

const updateTimeBlockSchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  activity: z.string().optional(),
});

const createTimeBlockSchema = z.object({
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  activity: z.string().min(1),
});

const updatePillarSchema = z.object({
  current: z.number().optional(),
  target: z.number().optional(),
});

const updateWeeklyFocusSchema = z.object({
  focusStatement: z.string().optional(),
  topFive: z.array(z.string()).optional(),
});

const updateReflectionSchema = z.object({
  wins: z.string().optional(),
  challenges: z.string().optional(),
  gratitude: z.string().optional(),
  nextWeekIntention: z.string().optional(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Initialize defaults for new users
      if (user) {
        await storage.initializeUserDefaults(userId);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Daily alignment endpoints
  app.get("/api/daily", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const today = getToday();
      
      // Get all daily data
      const [alignment, tasks, schedule] = await Promise.all([
        storage.getDailyAlignment(userId, today),
        storage.getTasks(userId, today),
        storage.getTimeBlocks(userId, today),
      ]);

      res.json({
        energyLevel: alignment?.energyLevel || "normal",
        tasks,
        schedule,
        verse: {
          text: alignment?.verseText || "I will instruct you and teach you in the way you should go.",
          reference: alignment?.verseReference || "Psalm 32:8",
        },
      });
    } catch (error) {
      console.error("Error fetching daily data:", error);
      res.status(500).json({ error: "Failed to fetch daily alignment data" });
    }
  });

  app.patch("/api/daily/energy", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = energyLevelSchema.safeParse(req.body.level);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid energy level" });
      }
      
      const today = getToday();
      const alignment = await storage.upsertDailyAlignment({
        userId,
        date: today,
        energyLevel: result.data,
      });
      
      res.json({ level: alignment.energyLevel });
    } catch (error) {
      console.error("Error updating energy level:", error);
      res.status(500).json({ error: "Failed to update energy level" });
    }
  });

  // Task endpoints
  app.get("/api/tasks", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = (req.query.date as string) || getToday();
      const tasks = await storage.getTasks(userId, date);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = createTaskSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid task data" });
      }
      
      const today = getToday();
      const existingTasks = await storage.getTasks(userId, today);
      
      const task = await storage.createTask({
        userId,
        title: result.data.title,
        order: result.data.order ?? existingTasks.length + 1,
        date: today,
        completed: false,
      });
      
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", firebaseAuth, async (req: any, res) => {
    try {
      const result = updateTaskSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid task update data" });
      }
      
      const task = await storage.updateTask(req.params.id, result.data);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", firebaseAuth, async (req: any, res) => {
    try {
      const deleted = await storage.deleteTask(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Time block endpoints
  app.get("/api/schedule", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = (req.query.date as string) || getToday();
      const blocks = await storage.getTimeBlocks(userId, date);
      res.json(blocks);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      res.status(500).json({ error: "Failed to fetch schedule" });
    }
  });

  app.post("/api/schedule", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = createTimeBlockSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid time block data" });
      }
      
      const today = getToday();
      const block = await storage.createTimeBlock({
        userId,
        startTime: result.data.startTime,
        endTime: result.data.endTime,
        activity: result.data.activity,
        date: today,
      });
      
      res.status(201).json(block);
    } catch (error) {
      console.error("Error creating time block:", error);
      res.status(500).json({ error: "Failed to create time block" });
    }
  });

  app.patch("/api/schedule/:id", firebaseAuth, async (req: any, res) => {
    try {
      const result = updateTimeBlockSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid time block update data" });
      }
      
      const block = await storage.updateTimeBlock(req.params.id, result.data);
      if (!block) {
        return res.status(404).json({ error: "Time block not found" });
      }
      res.json(block);
    } catch (error) {
      console.error("Error updating time block:", error);
      res.status(500).json({ error: "Failed to update time block" });
    }
  });

  app.delete("/api/schedule/:id", firebaseAuth, async (req: any, res) => {
    try {
      const deleted = await storage.deleteTimeBlock(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Time block not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting time block:", error);
      res.status(500).json({ error: "Failed to delete time block" });
    }
  });

  // Weekly endpoints
  app.get("/api/weekly", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const weekStart = getWeekStart();
      
      const [pillars, focus] = await Promise.all([
        storage.getPillars(userId, weekStart),
        storage.getWeeklyFocus(userId, weekStart),
      ]);

      res.json({
        pillars,
        focusStatement: focus?.focusStatement || "",
        topFive: focus?.topFive || [],
      });
    } catch (error) {
      console.error("Error fetching weekly data:", error);
      res.status(500).json({ error: "Failed to fetch weekly data" });
    }
  });

  // Pillar endpoints
  app.patch("/api/pillars/:id", firebaseAuth, async (req: any, res) => {
    try {
      const result = updatePillarSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid pillar update data" });
      }
      
      const pillar = await storage.updatePillar(req.params.id, result.data);
      if (!pillar) {
        return res.status(404).json({ error: "Pillar not found" });
      }
      res.json(pillar);
    } catch (error) {
      console.error("Error updating pillar:", error);
      res.status(500).json({ error: "Failed to update pillar" });
    }
  });

  // Weekly focus endpoints
  app.patch("/api/weekly/focus", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = updateWeeklyFocusSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid focus update data" });
      }
      
      const weekStart = getWeekStart();
      const focus = await storage.upsertWeeklyFocus({
        userId,
        weekStart,
        focusStatement: result.data.focusStatement,
        topFive: result.data.topFive,
      });
      
      res.json(focus);
    } catch (error) {
      console.error("Error updating weekly focus:", error);
      res.status(500).json({ error: "Failed to update weekly focus" });
    }
  });

  // Reflection endpoints
  app.get("/api/reflections", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const weekStart = (req.query.weekStart as string) || getWeekStart();
      const reflection = await storage.getReflection(userId, weekStart);
      res.json(reflection || null);
    } catch (error) {
      console.error("Error fetching reflection:", error);
      res.status(500).json({ error: "Failed to fetch reflection" });
    }
  });

  app.patch("/api/reflections", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = updateReflectionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid reflection data" });
      }
      
      const weekStart = getWeekStart();
      const reflection = await storage.upsertReflection({
        userId,
        weekStart,
        wins: result.data.wins,
        challenges: result.data.challenges,
        gratitude: result.data.gratitude,
        nextWeekIntention: result.data.nextWeekIntention,
      });
      
      res.json(reflection);
    } catch (error) {
      console.error("Error updating reflection:", error);
      res.status(500).json({ error: "Failed to update reflection" });
    }
  });

  // AI Prioritization endpoint
  app.get("/api/ai/prioritize", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const today = getToday();
      const weekStart = getWeekStart();
      
      const [alignment, tasks, pillars] = await Promise.all([
        storage.getDailyAlignment(userId, today),
        storage.getTasks(userId, today),
        storage.getPillars(userId, weekStart),
      ]);

      const energyLevel = (alignment?.energyLevel || "normal") as EnergyLevel;
      
      const suggestion = await getAIPrioritization({
        energyLevel,
        tasks,
        pillars,
      });
      
      res.json(suggestion);
    } catch (error) {
      console.error("Error getting AI prioritization:", error);
      res.status(500).json({ error: "Failed to get AI suggestions" });
    }
  });

  // ========== ONBOARDING ENDPOINTS ==========

  // Get onboarding progress
  app.get("/api/onboarding/progress", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getOnboardingProgress(userId);
      res.json(progress || { currentStep: 1, onboardingComplete: false });
    } catch (error) {
      console.error("Error fetching onboarding progress:", error);
      res.status(500).json({ error: "Failed to fetch onboarding progress" });
    }
  });

  // Update onboarding progress
  app.patch("/api/onboarding/progress", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = onboardingProgressSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid progress data" });
      }

      const progress = await storage.upsertOnboardingProgress({
        userId,
        ...result.data,
      });
      res.json(progress);
    } catch (error) {
      console.error("Error updating onboarding progress:", error);
      res.status(500).json({ error: "Failed to update onboarding progress" });
    }
  });

  // ========== IDENTITY PROFILE ENDPOINTS ==========

  app.get("/api/profile/identity", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getIdentityProfile(userId);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching identity profile:", error);
      res.status(500).json({ error: "Failed to fetch identity profile" });
    }
  });

  app.patch("/api/profile/identity", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = identityProfileSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid identity profile data" });
      }

      const profile = await storage.upsertIdentityProfile({
        userId,
        ...result.data,
      });
      res.json(profile);
    } catch (error) {
      console.error("Error updating identity profile:", error);
      res.status(500).json({ error: "Failed to update identity profile" });
    }
  });

  // ========== PURPOSE PROFILE ENDPOINTS ==========

  app.get("/api/profile/purpose", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getPurposeProfile(userId);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching purpose profile:", error);
      res.status(500).json({ error: "Failed to fetch purpose profile" });
    }
  });

  app.patch("/api/profile/purpose", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = purposeProfileSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid purpose profile data" });
      }

      const profile = await storage.upsertPurposeProfile({
        userId,
        ...result.data,
      });
      res.json(profile);
    } catch (error) {
      console.error("Error updating purpose profile:", error);
      res.status(500).json({ error: "Failed to update purpose profile" });
    }
  });

  // ========== SEASON PILLARS ENDPOINTS ==========

  app.get("/api/profile/season-pillars", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pillars = await storage.getSeasonPillars(userId);
      res.json(pillars);
    } catch (error) {
      console.error("Error fetching season pillars:", error);
      res.status(500).json({ error: "Failed to fetch season pillars" });
    }
  });

  app.post("/api/profile/season-pillars", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = seasonPillarSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid season pillar data" });
      }

      const existingPillars = await storage.getSeasonPillars(userId);
      const pillar = await storage.createSeasonPillar({
        userId,
        ...result.data,
        order: result.data.order ?? existingPillars.length,
      });
      res.status(201).json(pillar);
    } catch (error) {
      console.error("Error creating season pillar:", error);
      res.status(500).json({ error: "Failed to create season pillar" });
    }
  });

  app.patch("/api/profile/season-pillars/:id", firebaseAuth, async (req: any, res) => {
    try {
      const result = seasonPillarSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid season pillar update data" });
      }

      const pillar = await storage.updateSeasonPillar(req.params.id, result.data);
      if (!pillar) {
        return res.status(404).json({ error: "Season pillar not found" });
      }
      res.json(pillar);
    } catch (error) {
      console.error("Error updating season pillar:", error);
      res.status(500).json({ error: "Failed to update season pillar" });
    }
  });

  app.delete("/api/profile/season-pillars/:id", firebaseAuth, async (req: any, res) => {
    try {
      const deleted = await storage.deleteSeasonPillar(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Season pillar not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting season pillar:", error);
      res.status(500).json({ error: "Failed to delete season pillar" });
    }
  });

  // ========== VISION MAP ENDPOINTS ==========

  app.get("/api/profile/vision", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const visionMap = await storage.getVisionMap(userId, year);
      res.json(visionMap || null);
    } catch (error) {
      console.error("Error fetching vision map:", error);
      res.status(500).json({ error: "Failed to fetch vision map" });
    }
  });

  app.patch("/api/profile/vision", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = visionMapSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid vision map data" });
      }

      const visionMap = await storage.upsertVisionMap({
        userId,
        ...result.data,
      });
      res.json(visionMap);
    } catch (error) {
      console.error("Error updating vision map:", error);
      res.status(500).json({ error: "Failed to update vision map" });
    }
  });

  // ========== CAPACITY PROFILE ENDPOINTS ==========

  app.get("/api/profile/capacity", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getCapacityProfile(userId);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching capacity profile:", error);
      res.status(500).json({ error: "Failed to fetch capacity profile" });
    }
  });

  app.patch("/api/profile/capacity", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = capacityProfileSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid capacity profile data" });
      }

      const profile = await storage.upsertCapacityProfile({
        userId,
        ...result.data,
      });
      res.json(profile);
    } catch (error) {
      console.error("Error updating capacity profile:", error);
      res.status(500).json({ error: "Failed to update capacity profile" });
    }
  });

  // ========== MONETIZATION ENGINE ENDPOINTS ==========

  // Get current monetization recommendation
  app.get("/api/ai/monetization", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const year = new Date().getFullYear();
      const quarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;

      const recommendation = await storage.getMonetizationRecommendation(userId, quarter, year);
      res.json(recommendation || null);
    } catch (error) {
      console.error("Error fetching monetization recommendation:", error);
      res.status(500).json({ error: "Failed to fetch monetization recommendation" });
    }
  });

  // Generate new monetization recommendation
  app.post("/api/ai/monetization/generate", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const year = new Date().getFullYear();
      const quarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;

      const [identity, purpose, seasonPillars, capacity] = await Promise.all([
        storage.getIdentityProfile(userId),
        storage.getPurposeProfile(userId),
        storage.getSeasonPillars(userId),
        storage.getCapacityProfile(userId),
      ]);

      const result = await generateMonetizationPlan({
        identity: identity || null,
        purpose: purpose || null,
        seasonPillars: seasonPillars || [],
        capacity: capacity || null,
      });

      const recommendation = await storage.createMonetizationRecommendation({
        userId,
        primaryPath: result.primaryPath,
        rationale: result.rationale,
        monthPlans: result.monthPlans,
        weeklyActions: result.weeklyActions,
        secondaryOpportunities: result.secondaryOpportunities,
        deferredItems: result.deferredItems,
        encouragement: result.encouragement,
        quarter,
        year,
      });

      res.status(201).json(recommendation);
    } catch (error) {
      console.error("Error generating monetization recommendation:", error);
      res.status(500).json({ error: "Failed to generate monetization recommendation" });
    }
  });

  // ========== TASK DISCERNMENT ENGINE ENDPOINTS ==========

  // Evaluate a single task
  app.post("/api/ai/task/:id/evaluate", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = req.params.id;
      const today = getToday();

      const [tasks, identity, purpose, seasonPillars, capacity, alignment] = await Promise.all([
        storage.getTasks(userId, today),
        storage.getIdentityProfile(userId),
        storage.getPurposeProfile(userId),
        storage.getSeasonPillars(userId),
        storage.getCapacityProfile(userId),
        storage.getDailyAlignment(userId, today),
      ]);

      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      const currentEnergyLevel = (alignment?.energyLevel || "normal") as EnergyLevel;

      const result = await evaluateTask({
        task,
        identity: identity || null,
        purpose: purpose || null,
        seasonPillars: seasonPillars || [],
        capacity: capacity || null,
        currentEnergyLevel,
      });

      const assessment = await storage.createTaskAssessment({
        taskId,
        userId,
        pillarAlignment: result.pillarAlignment,
        monetizationAlignment: result.monetizationAlignment,
        purposeAlignment: result.purposeAlignment,
        impactScore: result.impactScore,
        effortScore: result.effortScore,
        energyRequirement: result.energyRequirement,
        decision: result.decision,
        bestTimeSlot: result.bestTimeSlot,
        assignTo: result.assignTo,
        peaceCheck: result.peaceCheck,
        reasoning: result.reasoning,
      });

      res.status(201).json(assessment);
    } catch (error) {
      console.error("Error evaluating task:", error);
      res.status(500).json({ error: "Failed to evaluate task" });
    }
  });

  // Get task assessment
  app.get("/api/ai/task/:id/assessment", firebaseAuth, async (req: any, res) => {
    try {
      const taskId = req.params.id;
      const assessment = await storage.getTaskAssessment(taskId);
      res.json(assessment || null);
    } catch (error) {
      console.error("Error fetching task assessment:", error);
      res.status(500).json({ error: "Failed to fetch task assessment" });
    }
  });

  // ========== GET ALL ONBOARDING DATA ==========

  app.get("/api/onboarding/all", firebaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const year = new Date().getFullYear();

      const [progress, identity, purpose, seasonPillars, vision, capacity] = await Promise.all([
        storage.getOnboardingProgress(userId),
        storage.getIdentityProfile(userId),
        storage.getPurposeProfile(userId),
        storage.getSeasonPillars(userId),
        storage.getVisionMap(userId, year),
        storage.getCapacityProfile(userId),
      ]);

      res.json({
        progress: progress || { currentStep: 1, onboardingComplete: false },
        identity: identity || null,
        purpose: purpose || null,
        seasonPillars: seasonPillars || [],
        vision: vision || null,
        capacity: capacity || null,
      });
    } catch (error) {
      console.error("Error fetching all onboarding data:", error);
      res.status(500).json({ error: "Failed to fetch onboarding data" });
    }
  });

  return httpServer;
}
