import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { createServer } from "http";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
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
async function buildSessionStore(): Promise<session.Store | undefined> {
  if (isProduction && process.env.DATABASE_URL) {
    const { default: connectPgSimple } = await import("connect-pg-simple");
    const { default: pg } = await import("pg");
    const PgSession = connectPgSimple(session);
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    return new PgSession({ pool, createTableIfMissing: true });
  } else {
    const MemoryStore = (await import("memorystore")).default(session);
    return new MemoryStore({ checkPeriod: 86400000 });
  }
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

  return app;
}

// Only start the HTTP server when NOT running on Vercel
const isVercel = !!process.env.VERCEL;
if (!isVercel) {
  (async () => {
    const application = await initApp();
    const server = createServer(application);
    server.timeout = 600000;
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;

    if (application.get("env") === "development") {
      await setupVite(application, server);
    } else {
      serveStatic(application);
    }

    const port = 5000;
    server.listen({ port, host: "0.0.0.0" }, () => {
      log(`serving on port ${port}`);
      console.log(`[Server] Started at ${new Date().toISOString()}`);
    });
  })();
}
