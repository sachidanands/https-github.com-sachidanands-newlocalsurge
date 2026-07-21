import fs from 'fs';
import path from 'path';

/**
 * gstack Automation CLI Runner for Local Surge SEO Lead Generation
 * Usage: npx tsx scratch/run_outreach_campaign.ts --niche="Plumbing Services" --location="San Jose, CA"
 */

async function main() {
  const args = process.argv.slice(2);
  let niche = "Plumbing & Rooter";
  let location = "San Jose, CA";

  args.forEach(arg => {
    if (arg.startsWith('--niche=')) niche = arg.split('=')[1];
    if (arg.startsWith('--location=')) location = arg.split('=')[1];
  });

  console.log(`🚀 Starting Outbound Lead Gen Campaign (gstack Quality Protocol)...`);
  console.log(`📍 Industry: ${niche}`);
  console.log(`📍 Location: ${location}`);

  const adminToken = "surge_fake_secure_token_2026";
  const baseUrl = process.env.APP_URL || "http://localhost:3000";

  try {
    // 1. Prospect Scan
    console.log(`\n1️⃣ Querying local business prospects and validating MX email syntax...`);
    const prospectRes = await fetch(`${baseUrl}/api/outreach/prospect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ niche, location })
    });

    if (!prospectRes.ok) {
      console.error(`❌ Prospecting API failed: ${prospectRes.statusText}`);
      return;
    }

    const prospectData: any = await prospectRes.json();
    const prospects = prospectData.prospects || [];
    console.log(`✅ Discovered ${prospects.length} verified business prospects.`);

    // 2. Generate Pitch & Teasers for each prospect
    console.log(`\n2️⃣ Running Gemini AI Local SEO Audits & generating 3-Point Teaser pitches...`);
    for (const prospect of prospects) {
      console.log(`   👉 Processing: ${prospect.businessName} (${prospect.email})`);
      const pitchRes = await fetch(`${baseUrl}/api/outreach/generate-pitch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ prospect })
      });

      if (pitchRes.ok) {
        const pitchData: any = await pitchRes.json();
        console.log(`      🟢 Pitch queued successfully! SEO Audit Score: ${pitchData.pitchItem.auditScore}/100`);
      } else {
        console.warn(`      ⚠️ Failed queuing pitch for ${prospect.businessName}`);
      }
    }

    console.log(`\n🎉 Campaign Execution Complete! All generated pitches are now queued in your Lead Dashboard for 1-click review & dispatch.`);
  } catch (err: any) {
    console.error(`❌ Campaign execution exception:`, err.message || err);
  }
}

main();
