// Vercel Serverless Function catch-all entry point for all /api/* routes.
// Ensures routes like /api/frontdesk/trial, /api/contact, /api/leads, etc.
// are natively routed to the Express app with full req.url intact.
import app from "./_server.js";

export default app;
