import { createServer } from "node:http";
import { createApp, attachErrorHandler } from "./app";
import { setupVite, serveStatic } from "./vite";
import { log } from "./log";

const app = createApp();
const server = createServer(app);

if (app.get("env") === "development") {
  await setupVite(app, server);
} else {
  serveStatic(app);
}

attachErrorHandler(app);

const port = Number(process.env.PORT ?? 5000);
server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
  log(`serving on port ${port}`);
});
