import app from "./api/_server";
import { createServer as createViteServer } from "vite";

import { prerenderLocationHtmlWithStatus } from "./api/prerender";
import path from "path";
import fs from "fs";

const PORT = 3000;

async function startDevServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  
  // Intercept routes to inject pre-rendered HTML and headers in dev
  app.use(async (req, res, next) => {
    if (
      req.method === "GET" && 
      !req.path.startsWith("/@") && 
      !req.path.startsWith("/src") && 
      !req.path.startsWith("/node_modules") && 
      !req.path.includes(".") &&
      !req.path.startsWith("/api")
    ) {
      try {
        const templatePath = path.join(process.cwd(), "index.html");
        let template = fs.readFileSync(templatePath, "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        const { html: renderedHtml, status } = prerenderLocationHtmlWithStatus(template, req.path);
        return res.status(status).set({ "Content-Type": "text/html" }).end(renderedHtml);
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
