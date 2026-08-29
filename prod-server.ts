import app from "./api/_server";
import path from "path";
import express from "express";

import { prerenderLocationHtml } from "./api/prerender";
import fs from "fs";

const PORT = process.env.PORT || 3000;

const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, "utf-8");
    html = prerenderLocationHtml(html, req.path);
    return res.status(200).set({ "Content-Type": "text/html" }).send(html);
  }
  res.sendFile(indexPath);
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
