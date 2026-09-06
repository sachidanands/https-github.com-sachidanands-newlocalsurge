---
name: youtube-analytics
description: YouTube Shorts & Reels performance analytics and AI-driven video content blueprint planning for @LocalSurgeSEO. Use when the user mentions YouTube, Shorts, Reels, video analytics, video strategy, YouTube Data API, or video content planning.
---

# YouTube Analytics & Reels Content Planner for @LocalSurgeSEO

This skill connects to Google Cloud YouTube Data API v3 to analyze video performance for `@LocalSurgeSEO` and generates research-backed 60-second Reels/Shorts blueprints to drive contractor and local business inbound leads to `localsurgeseo.com`.

## When to Use This Skill
- The user asks about YouTube channel performance, views, subscriber growth, or Shorts engagement.
- The user wants ideas, scripts, or blueprints for their next YouTube Shorts or Instagram/FB Reels.
- The user mentions "YouTube analytics", "YouTube API", "video planning", "Reel ideas", "Shorts strategy", or "video topic clusters".
- Running on-demand performance audits or generating updated video content roadmaps.

## Architecture & Configuration

1. **Script Location:** `scripts/youtube_report.ts`
2. **Execution Command:**
   ```bash
   npm run youtube:report
   ```
3. **Environment Variables:**
   - Uses `YOUTUBE_API_KEY` (or falls back to `GOOGLE_API_KEY` / `PAGESPEED_API_KEY`) from `.env`.
   - If no live API key is configured or offline, gracefully falls back to calibrated channel benchmarks for `@LocalSurgeSEO`.
4. **Outputs Generated:**
   - [`YOUTUBE-ANALYTICS-REPORT.md`](file:///home/ved/Websites/newlocalsurge/YOUTUBE-ANALYTICS-REPORT.md): Comprehensive Markdown report with KPI cards, video engagement tables, topic performance, and 5 complete 60-second Reel blueprints (3s hook, problem, agitation, 3-step fix, and CTA).
   - `youtube_report.json`: Machine-readable structured dataset.

## How to Run & Analyze

When the user asks for YouTube analytics or Reel planning:
1. Run the report generation:
   ```bash
   npm run youtube:report
   ```
2. Read the resulting [`YOUTUBE-ANALYTICS-REPORT.md`](file:///home/ved/Websites/newlocalsurge/YOUTUBE-ANALYTICS-REPORT.md).
3. Provide direct insights to the user, highlighting:
   - High-performing topic pillars (e.g. Google Business Profile tips, Core Web Vitals comparisons).
   - Engagement rate benchmarks (target > 8%).
   - Ready-to-record 3-second hook scripts tailored to local contractors and small business owners.
