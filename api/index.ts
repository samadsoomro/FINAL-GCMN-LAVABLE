import { app, initApp } from "../server/index";

let ready: Promise<void> | null = null;

function ensureInitialized() {
    if (!ready) {
        ready = initApp().then(() => { });
    }
    return ready;
}

export default async function handler(req: any, res: any) {
    await ensureInitialized();
    return app(req, res);
}
