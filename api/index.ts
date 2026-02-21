import type { VercelRequest, VercelResponse } from "@vercel/node";
import { app, initApp } from "../server/index";

// Initialize the Express app (only runs once per cold start on Vercel)
await initApp();

export default function handler(req: VercelRequest, res: VercelResponse) {
    // Delegate all requests to the Express app
    return app(req as any, res as any);
}
