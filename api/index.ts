// api/index.ts
// Optimized for Vercel Serverless Functions
import { initApp } from "../server/index";

let cachedApp: any = null;

export default async function handler(req: any, res: any) {
    try {
        if (!cachedApp) {
            console.log("[Vercel API] Cold start: Loading Express app...");
            cachedApp = await initApp();
            console.log("[Vercel API] Express app initialized successfully.");
        }

        return cachedApp(req, res);
    } catch (error: any) {
        console.error("[Vercel API] Fatal Error:", error);

        // Check if headers are already sent to prevent Double Error Crash
        if (!res.headersSent) {
            res.setHeader("Content-Type", "application/json");
            res.status(500).json({
                error: "A server error occurred during initialization.",
                details: error?.message || String(error)
            });
        }
    }
}

