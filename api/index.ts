import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const module = await import("../server.ts");
    const app = module.default;
    return app(req, res);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to load Express application",
      message: error.message || String(error),
      stack: error.stack || null,
    });
  }
}
