// api/index.ts
// Optimized for Vercel Serverless Functions
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import path from "path";
import serverless from "serverless-http";
import compression from "compression";
import { registerRoutes } from "../server/routes.js";
import { log } from "../server/log.js";
import { storage } from "../server/db-storage.js";

const app = express();
app.use(express.json({ limit: "1024mb" }));
app.use(express.urlencoded({ extended: false, limit: "1024mb" }));
app.use(compression());

const isProduction = process.env.NODE_ENV === "production";

// Build the session store:
// - Production (Vercel): use connect-pg-simple with Supabase Postgres
// - Development: use memorystore
async function buildSessionStore(): Promise<session.Store> {
  const DEFAULT_MEMORY_STORE_PERIOD = 86400000;

  try {
    if (isProduction && process.env.DATABASE_URL) {
      log("Attempting to initialize Postgres session store...", "session");
      const { default: connectPgSimple } = await import("connect-pg-simple");
      const { default: pg } = await import("pg");
      const PgSession = connectPgSimple(session);
      const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });

      const store = new PgSession({
        pool,
        createTableIfMissing: false,
        tableName: "sessions",
        schemaName: "public"
      });

      log("Postgres session store instance created.", "session");
      return store;
    }
  } catch (err: any) {
    log(`Postgres session store failed: ${err.message}. Falling back to MemoryStore.`, "session");
  }

  log("Using MemoryStore for sessions.", "session");
  const MemoryStore = (await import("memorystore")).default(session);
  return new MemoryStore({ checkPeriod: DEFAULT_MEMORY_STORE_PERIOD });
}

app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

let initialized = false;
let serverlessHandler: any = null;

async function initServerlessApp() {
  if (initialized) return;
  initialized = true;

  const store = await buildSessionStore();
  app.use(
    session({
      cookie: {
        maxAge: 86400000,
        secure: isProduction,
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
      },
      store,
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "gcfm-library-secret-2026",
    }),
  );

  await storage.init();
  registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Serve static uploads directory
  const uploadDir = path.join(process.cwd(), "server", "uploads");
  app.use("/server/uploads", express.static(uploadDir));

  // Vercel static fallback
  if (process.env.NODE_ENV !== "development" || !!process.env.VERCEL) {
    const { serveStatic } = await import("../server/vite.js");
    serveStatic(app);
  }
}

export default async function handler(req: any, res: any) {
  try {
    if (!serverlessHandler) {
      await initServerlessApp();
      serverlessHandler = serverless(app);
    }
    return serverlessHandler(req, res);
  } catch (error: any) {
    console.error("[Vercel API] Fatal Boot Error:", error);
    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/json");
      res.status(500).json({
        error: "Critical server initialization failure.",
        details: error?.message || String(error)
      });
    }
  }
}

