// api/index.ts
// Optimized for Vercel Serverless Functions

let cachedApp: any = null;

export default async function handler(req: any, res: any) {
    try {
        if (!cachedApp) {
            console.log("[Vercel API] Cold start: Loading Express app...");
            // Dynamic import to prevent top-level execution blocking
            const { initApp } = await import("../server/index");
            cachedApp = await initApp();
            console.log("[Vercel API] Express app initialized successfully.");
        }

        return cachedApp(req, res);
    } catch (error: any) {
        console.error("[Vercel API] Fatal Error:", error);
        res.setHeader("Content-Type", "application/json");
        res.status(500).json({
            error: error.message,
            steps: "Error during lazy initialization on Vercel"
        });
    }
}
