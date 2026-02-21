import type { Context, Config } from "@netlify/functions";

let cachedHandler: any = null;

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);

  // Minimal diagnostic route
  if (url.pathname === "/api/health") {
    return new Response(JSON.stringify({
      status: "ok",
      env: {
        NETLIFY: process.env.NETLIFY,
        SITE_ID: process.env.SITE_ID,
        CONTEXT: process.env.CONTEXT,
        NODE_ENV: process.env.NODE_ENV
      }
    }), { headers: { "Content-Type": "application/json" } });
  }

  try {
    if (!cachedHandler) {
      console.log("[API] Cold start: Loading server modules...");

      // Dynamic imports to avoid top-level issues
      const serverless = (await import("serverless-http")).default;
      const { initApp } = await import("../../server/index");

      console.log("[API] Initializing Express app...");
      const application = await initApp();

      cachedHandler = serverless(application);
      console.log("[API] Serverless handler created.");
    }

    return await cachedHandler(req, context);
  } catch (error: any) {
    console.error("[API] Fatal Error:", error);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack,
      steps: "Error during lazy initialization"
    }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

export const config: Config = {
  path: "/api/*",
};
