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

// Trust proxy for Vercel (required for secure cookies)
app.set("trust proxy", 1);

const isProduction = process.env.NODE_ENV === "production";

// Global cache for singleton instances in serverless environment
let cachedPool: any = null;
let cachedStore: session.Store | null = null;
// - Production (Vercel): use connect-pg-simple with Supabase Postgres
// - Development: use memorystore
// Build the session store:
async function buildSessionStore(): Promise<session.Store> {
  const DEFAULT_MEMORY_STORE_PERIOD = 86400000;

  if (cachedStore) {
    log("Using cached session store instance.", "session");
    return cachedStore;
  }

  try {
    if (process.env.DATABASE_URL) {
      log("Attempting to initialize Postgres session store...", "session");
      const { default: connectPgSimple } = await import("connect-pg-simple");
      const { default: pg } = await import("pg");
      const PgSession = connectPgSimple(session);

      if (!cachedPool) {
        log("Initializing conservative Postgres pool for serverless...", "session");
        cachedPool = new pg.Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
          max: 5, // Increase to 5 to allow some concurrency
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 15000,
        });

        cachedPool.on("error", (err: any) => {
          log(`Unexpected pool error: ${err.message}`, "error");
          cachedPool = null; // Forces recreation on next request
          cachedStore = null;
        });

        // Verify connection immediately
        await cachedPool.query("SELECT 1");
        log("Postgres pooling stable.", "session");
      }

      cachedStore = new PgSession({
        pool: cachedPool,
        createTableIfMissing: true,
        tableName: "sessions",
        schemaName: "public"
      });

      log("Postgres session store instance created.", "session");
      return cachedStore;
    }
  } catch (err: any) {
    log(`Postgres session store failed: ${err.message}`, "session");
    if (isProduction) {
      throw new Error(`Critical: Postgres session store failed in production: ${err.message}`);
    }
  }

  log("Using MemoryStore for sessions (Non-Production fallback).", "session");
  const MemoryStore = (await import("memorystore")).default(session);
  cachedStore = new MemoryStore({ checkPeriod: DEFAULT_MEMORY_STORE_PERIOD });
  return cachedStore;
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

    // Diagnostic headers
    res.setHeader("X-Store-Type", cachedPool ? "postgres" : "memory");
    res.setHeader("X-Vercel-Initialized", initialized ? "true" : "false");

    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms [Store: ${cachedPool ? "PG" : "MEM"}]`;
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
  // Note: We don't set initialized=true here yet to allow retries on failure

  const store = await buildSessionStore();

  // Important: Explicitly set the store in the app context
  app.set('sessionStore', store);

  app.use(
    session({
      name: "gcfm.sid",
      proxy: true,
      cookie: {
        maxAge: 86400000,
        secure: true, // Always true for production Vercel
        httpOnly: true,
        sameSite: "lax",
      },
      store,
      resave: true, // Revert to true for serverless persistence
      saveUninitialized: false,
      rolling: true,
      secret: process.env.SESSION_SECRET || "gcfm-library-secret-2026",
    }),
  );

  // Diagnostic middleware for authorization tracking
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/auth/me")) {
      const authInfo = {
        hasSession: !!req.session,
        id: req.sessionID,
        user: req.session?.userId,
        isAdmin: req.session?.isAdmin
      };
      log(`[AUTH-DIAG] ${JSON.stringify(authInfo)}`, "session");
    }
    next();
  });

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

  initialized = true; // Mark as successful only at the very end
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

    // NATIVE RECOVERY: Do not use Express methods here as 'app' might be broken
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({
        error: "Critical server initialization failure.",
        details: error?.message || String(error),
        timestamp: new Date().toISOString()
      }));
    }
  }
}

