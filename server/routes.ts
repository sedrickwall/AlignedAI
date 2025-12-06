import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

const energyLevelSchema = z.enum(["low", "normal", "high"]);

const updateTaskSchema = z.object({
  completed: z.boolean(),
});


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/daily", async (_req, res) => {
    try {
      const data = await storage.getDailyAlignment();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily alignment data" });
    }
  });

  app.patch("/api/daily/energy", async (req, res) => {
    try {
      const result = energyLevelSchema.safeParse(req.body.level);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid energy level" });
      }
      const level = await storage.updateEnergyLevel(result.data);
      res.json({ level });
    } catch (error) {
      res.status(500).json({ error: "Failed to update energy level" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const result = updateTaskSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid task update data" });
      }
      const task = await storage.updateTask(req.params.id, result.data.completed);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.get("/api/weekly", async (_req, res) => {
    try {
      const data = await storage.getWeeklyData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weekly data" });
    }
  });

  return httpServer;
}
