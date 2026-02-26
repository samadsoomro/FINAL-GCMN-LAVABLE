// api/index.ts
// Optimized for Vercel Serverless Functions
import { initApp } from "../server/index";
import serverless from "serverless-http";

let serverlessHandler: any = null;

export default async function handler(req: any, res: any) {
    try {
        if (!serverlessHandler) {
            console.log("[Vercel API] Cold start: Loading Express app...");
            const app = await initApp();

            // Wrap the initialized Express app with Serverless HTTP
            // This guarantees all Express routes and async errors are caught 
            // and transformed into valid HTTP responses instead of crashing the lambda.
            serverlessHandler = serverless(app);

            console.log("[Vercel API] Express app initialized and wrapped successfully.");
        }

        return serverlessHandler(req, res);
    } catch (error: any) {
        console.error("[Vercel API] Fatal Boot Error:", error);

        // Ultimate fallback if the Express app completely fails to boot
        if (!res.headersSent) {
            res.setHeader("Content-Type", "application/json");
            res.status(500).json({
                error: "Critical server initialization failure.",
                details: error?.message || String(error)
            });
        }
    }
}

