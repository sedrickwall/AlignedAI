// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { serveStatic } from "./static.js";
import { createServer } from "http";
import cors from "cors";

import { evaluateTaskAgainstMission } from "./taskAnalyzer.js";   // FIXED
import type { MissionContext } from "../shared/taskEval.js";       // FIXED

const app = express();
const httpServer = createServer(app);

// ------------------------------------------------------
// 🔧 Middleware
// ------------------------------------------------------

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://aligned.vercel.app",
      /^https:\/\/aligned-.*\.vercel\.app$/ // your preview deployments
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check for Cloud Run / load balancers
app.get("/health", (_req: Request, res: Response) => res.send("ok"));

declare module "http" {
  interface IncomingMessage {
    rawBody?: unknown;
  }
}

// ------------------------------------------------------
// 🧠 Task Evaluation API
// ------------------------------------------------------

app.post("/api/evaluate-task", async (req: Request, res: Response) => {
  try {
    const { task, mission } = req.body as {
      task: string;
      mission: MissionContext;
    };

    if (!task || !mission) {
      return res.status(400).json({ error: "task and mission are required" });
    }

    const result = await evaluateTaskAgainstMission(task, mission);
    return res.json(result);
  } catch (err: any) {
    console.error("[/api/evaluate-task] error", err);
    return res.status(500).json({
      error: "Failed to evaluate task",
      details: err.message || String(err),
    });
  }
});

// ------------------------------------------------------
// 📜 API Logging
// ------------------------------------------------------

function log(message: string, source = "express") {
  const formatted = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  console.log(`${formatted} [${source}] ${message}`);
}

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let captured: any;

  const original = res.json.bind(res);
  // replace json while keeping types explicit to avoid implicit any errors
  (res as any).json = function (body: unknown, ...args: unknown[]) {
    captured = body;
    // avoid spreading an unknown-typed rest directly (TS2556) by using apply and concat
    return (original as any).apply(null, [body].concat(args as any));
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      const duration = Date.now() - start;
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms :: ${JSON.stringify(captured)}`);
    }
  });

  next();
});

// ------------------------------------------------------
// 🚀 Server Bootstrapping (Cloud Run Safe)
// ------------------------------------------------------

(async () => {
  try {
    const port = Number(process.env.PORT || 8080);

    httpServer.listen(
      {
        port,
        host: "0.0.0.0",
        reusePort: true,
      },
      async () => {
        log(`Serving on port ${port}`);

        // 🚨 Anything that can fail goes AFTER listen
        try {
          await registerRoutes(httpServer, app);

          app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
            const status = err.status || 500;
            res.status(status).json({
              message: err.message || "Internal Server Error",
            });
          });

          if (process.env.NODE_ENV === "production") {
            serveStatic(app);
          } else {
            const { setupVite } = await import("./vite.js");
            await setupVite(httpServer, app);
          }

          log("Routes registered successfully");
        } catch (err) {
          console.error("Startup task failed:", err);
        }
      }
    );
  } catch (err) {
    console.error("Fatal startup error:", err);
    process.exit(1);
  }
})();

