// Vercel Serverless Function entry point.
// Imports and re-exports the Express app so Vercel can invoke it
// as a serverless function on every API request.
// The VERCEL=1 env var is automatically set by Vercel, which
// prevents server.ts from calling app.listen() (not needed in serverless mode).
import app from "../server";

export default app;
