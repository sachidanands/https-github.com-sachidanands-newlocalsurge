import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { BLOG_POSTS, getClusterForPost } from '../src/data/blogData';

async function syncBlogsToSupabase() {
  console.log(`\x1b[1;36m========================================================================\x1b[0m`);
  console.log(`\x1b[1;36m   ⚡ LOCAL SURGE SEO — Supabase Blog Synchronization Pipeline          \x1b[0m`);
  console.log(`\x1b[1;36m========================================================================\x1b[0m\n`);

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(`\x1b[31m✖ Error: SUPABASE_URL or SUPABASE_KEY/SUPABASE_SERVICE_ROLE_KEY missing in .env!\x1b[0m`);
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log(`✔ Connected to Supabase at ${supabaseUrl}`);

  // Test table existence
  const { data: testData, error: testError } = await supabase
    .from('blogs')
    .select('slug')
    .limit(1);

  if (testError && testError.code === '42P01') {
    console.warn(`\x1b[33m⚠️ Table 'blogs' does not exist yet in Supabase.\x1b[0m`);
    console.warn(`Please run the migration SQL file: supabase/migrations/20261024_create_blogs_table.sql in the Supabase SQL Editor.`);
    console.warn(`Attempting to sync after table creation...\n`);
    return;
  } else if (testError) {
    console.warn(`Notice: ${testError.message}`);
  } else {
    console.log(`✔ Table 'blogs' is active.`);
  }

  console.log(`⏳ Synchronizing ${BLOG_POSTS.length} blog posts to Supabase...`);

  let synced = 0;
  let errors = 0;

  for (const post of BLOG_POSTS) {
    const clusterInfo = getClusterForPost(post.slug);
    const row = {
      slug: post.slug,
      title: post.title,
      category: post.category,
      description: post.description,
      date: post.date,
      read_time: post.readTime,
      image: post.image,
      author: post.author,
      sections: post.sections,
      cluster_id: clusterInfo ? clusterInfo.cluster.id : null,
      status: 'published',
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('blogs')
      .upsert(row, { onConflict: 'slug' });

    if (error) {
      console.error(`✖ Failed to sync post: ${post.slug} ->`, error.message);
      errors++;
    } else {
      synced++;
    }
  }

  console.log(`\n\x1b[1;32m✔ Synchronization complete!\x1b[0m`);
  console.log(`   - Synced: ${synced} posts`);
  if (errors > 0) {
    console.log(`   - Errors: ${errors} posts`);
  }
}

syncBlogsToSupabase().catch(err => {
  console.error("Fatal error during sync:", err);
  process.exit(1);
});
