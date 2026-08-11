import { createApp, attachErrorHandler } from "./app";

const app = createApp();
attachErrorHandler(app);

export default app;
