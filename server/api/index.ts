import { app } from "../src/app";

// Vercel's Node.js runtime treats a default-exported request handler
// (req, res) => void as the function body — an Express app satisfies that
// signature as-is, so no server code needs to change for this to work.
// server/src/index.ts (app.listen) is still what runs locally via `npm run dev`.
export default app;
