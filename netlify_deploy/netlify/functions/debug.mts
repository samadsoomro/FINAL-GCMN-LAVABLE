import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
    const steps: string[] = [];
    try {
        steps.push("Starting resilient debug (JSON response mode)...");

        steps.push("Importing server/index...");
        const indexModule = await import("../../server/index");
        const { initApp } = indexModule;
        steps.push("server/index imported.");

        steps.push("Calling initApp()...");
        const app = await initApp();
        steps.push("initApp() finished successfully.");

        return new Response(JSON.stringify({
            status: "success",
            steps,
            info: "Application initialized successfully with session fallback resiliency."
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error: any) {
        // Return 200 but with failed status so we can READ the error
        return new Response(JSON.stringify({
            status: "fail",
            steps,
            error: error.message,
            stack: error.stack,
            type: typeof error
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    }
};
