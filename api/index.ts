// Vercel Serverless Function entry point.
// Imports and re-exports the Express app so Vercel can invoke it
// as a serverless function on every API request.
import app from "../server";

export default app;
