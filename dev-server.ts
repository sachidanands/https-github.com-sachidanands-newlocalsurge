import app from "./api/_server";
import { createServer as createViteServer } from "vite";

import { prerenderLocationHtml } from "./api/prerender";
import path from "path";
import fs from "fs";

const PORT = 3000;

async function startDevServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  
  // Intercept location routes to inject pre-rendered HTML for View Page Source in dev
  app.use(async (req, res, next) => {
    if (req.method === "GET" && (req.path === "/locations" || req.path.startsWith("/locations/"))) {
      try {
        const templatePath = path.join(process.cwd(), "index.html");
        let template = fs.readFileSync(templatePath, "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        template = prerenderLocationHtml(template, req.path);
        return res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        return next(e);
      }
    }
    next();
  });

  // Use Vite's connect instance as middleware
  app.use(vite.middlewares);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Development server running on http://localhost:${PORT}`);
  });
}

startDevServer();
