import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, getToday, getWeekStart } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { getAIPrioritization } from "./ai";
import { z } from "zod";
import type { EnergyLevel } from "@shared/schema";

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
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
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
  app.get("/api/daily", isAuthenticated, async (req: any, res) => {
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

  app.patch("/api/daily/energy", isAuthenticated, async (req: any, res) => {
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
  app.get("/api/tasks", isAuthenticated, async (req: any, res) => {
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

  app.post("/api/tasks", isAuthenticated, async (req: any, res) => {
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

  app.patch("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
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

  app.delete("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
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
  app.get("/api/schedule", isAuthenticated, async (req: any, res) => {
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

  app.post("/api/schedule", isAuthenticated, async (req: any, res) => {
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

  app.patch("/api/schedule/:id", isAuthenticated, async (req: any, res) => {
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

  app.delete("/api/schedule/:id", isAuthenticated, async (req: any, res) => {
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
  app.get("/api/weekly", isAuthenticated, async (req: any, res) => {
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
  app.patch("/api/pillars/:id", isAuthenticated, async (req: any, res) => {
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
  app.patch("/api/weekly/focus", isAuthenticated, async (req: any, res) => {
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
  app.get("/api/reflections", isAuthenticated, async (req: any, res) => {
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

  app.patch("/api/reflections", isAuthenticated, async (req: any, res) => {
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
  app.get("/api/ai/prioritize", isAuthenticated, async (req: any, res) => {
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

  return httpServer;
}
