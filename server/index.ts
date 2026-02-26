import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import { registerRoutes } from "./routes.js";
import { log } from "./log.js";

process.on("uncaughtException", (err) => {
  log(`UNCAUGHT EXCEPTION: ${err.message}`, "process");
  console.error(err.stack);
});

process.on("unhandledRejection", (reason, promise) => {
  log(`UNHANDLED REJECTION: ${reason}`, "process");
});
import { storage } from "./db-storage.js";

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
// app.use(compression());

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
        createTableIfMissing: false, // Prevents blocking query on Vercel cold starts
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

  // Custom minimal session store to avoid express-session native crashes on Node 24
  const sessionStore: Record<string, any> = {};
  app.use((req: any, res, next) => {
    // Simple cookie parser for session ID
    let sessionId = "";
    const cookieHeader = req.headers.cookie || "";
    const match = cookieHeader.match(/custom_sid=([^;]+)/);
    if (match) {
      sessionId = match[1];
    } else {
      sessionId = Math.random().toString(36).substring(2);
      res.setHeader("Set-Cookie", `custom_sid=${sessionId}; Path=/; HttpOnly`);
    }

    if (!sessionStore[sessionId]) {
      sessionStore[sessionId] = {};
    }
    req.session = sessionStore[sessionId];

    // Polyfill destroy and save for compatibility with existing code
    req.session.destroy = (cb: any) => {
      sessionStore[sessionId] = {};
      if (cb) cb();
    };
    req.session.save = (cb: any) => {
      if (cb) cb();
    };

    next();
  });

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
  // Always serve static for now to avoid Vite dev server crashes on Node 24
  if (true || process.env.NODE_ENV !== "development" || !!process.env.VERCEL) {
    const { serveStatic } = await import("./vite.js");
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

    /*
    if (application.get("env") === "development") {
      log("Initializing Vite setup...", "express");
      try {
        const { setupVite } = await import("./vite.js");
        await setupVite(application, server);
        log("Vite setup completed successfully.", "express");
      } catch (viteError: any) {
        log(`CRITICAL: Vite setup failed: ${viteError.message}`, "express");
        process.exit(1);
      }
    }
    */

    const port = parseInt(process.env.PORT || "5000", 10);
    log(`Attempting to listen on port ${port}...`, "express");
    try {
      server.listen({ port, host: "0.0.0.0" }, () => {
        log(`successfully serving on port ${port}`);
        console.log(`[Server] Started at ${new Date().toISOString()}`);
      });
    } catch (listenError: any) {
      log(`CRITICAL: Server failed to listen: ${listenError.message}`, "express");
      process.exit(1);
    }
  })();
}
