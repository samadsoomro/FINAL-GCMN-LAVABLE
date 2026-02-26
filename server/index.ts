import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { createServer } from "http";
import path from "path";
import { registerRoutes } from "./routes";
import { log } from "./log";
import { storage } from "./db-storage";
import compression from "compression";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    isAdmin?: boolean;
    isLibraryCard?: boolean;
  }
}

export const app = express();
app.use(express.json({ limit: "1024mb" }));
app.use(express.urlencoded({ extended: false, limit: "1024mb" }));
app.use(compression());

const isProduction = process.env.NODE_ENV === "production";

// Build the session store:
// - Production (Vercel): use connect-pg-simple with Supabase Postgres → persistent across serverless invocations
// - Development: use memorystore for convenience
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

      // Test the pool connection slightly to see if it's viable
      // but don't block too long. connect-pg-simple will handle its own queries.
      const store = new PgSession({
        pool,
        createTableIfMissing: true,
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

// Initialize app (routes, DB) — runs once per process/cold-start
let initialized = false;
export async function initApp() {
  if (initialized) return app;
  initialized = true;

  // Set up session middleware
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

  // Serve static uploads directory (only relevant in non-serverless environments)
  const uploadDir = path.join(process.cwd(), "server", "uploads");
  app.use("/server/uploads", express.static(uploadDir));

  // Vercel / Production static fallback
  if (process.env.NODE_ENV !== "development" || !!process.env.VERCEL) {
    const { serveStatic } = await import("./vite");
    serveStatic(app);
  }

  return app;
}

// Only start the HTTP server when NOT running on Vercel
const isServerless = !!process.env.VERCEL;
if (!isServerless) {
  (async () => {
    const application = await initApp();
    const server = createServer(application);
    server.timeout = 600000;
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;

    if (application.get("env") === "development") {
      const { setupVite } = await import("./vite");
      await setupVite(application, server);
    }

    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen({ port, host: "0.0.0.0" }, () => {
      log(`serving on port ${port}`);
      console.log(`[Server] Started at ${new Date().toISOString()}`);
    });
  })();
}
