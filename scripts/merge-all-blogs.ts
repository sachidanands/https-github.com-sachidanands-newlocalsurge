import fs from 'fs';
import path from 'path';
import { BlogPost, BLOG_POSTS, TOPIC_CLUSTERS, TopicCluster } from '../src/data/blogData';

const convertedJsonPath = '/home/ved/.gemini/antigravity-ide/brain/f54dab11-7a36-4018-a447-1273d73fec5d/scratch/converted_posts.json';
const targetBlogDataPath = path.join(process.cwd(), 'src/data/blogData.ts');

const newAndUpdatedPosts: BlogPost[] = JSON.parse(fs.readFileSync(convertedJsonPath, 'utf8'));

// Build map of existing posts
const postsMap = new Map<string, BlogPost>();
BLOG_POSTS.forEach(p => postsMap.set(p.slug, p));

// Merge updates and new additions
let updatedCount = 0;
let newCount = 0;

for (const post of newAndUpdatedPosts) {
  if (postsMap.has(post.slug)) {
    postsMap.set(post.slug, post);
    updatedCount++;
  } else {
    postsMap.set(post.slug, post);
    newCount++;
  }
}

const mergedPosts = Array.from(postsMap.values());

// Update Topic Clusters
const updatedClusters: Record<string, TopicCluster> = { ...TOPIC_CLUSTERS };

const techSpokes = new Set(updatedClusters['technical-schema'].spokeSlugs);
techSpokes.add('fix-duplicate-overlong-meta-descriptions');
techSpokes.add('seo-url-spaces-uppercase-parameters');
techSpokes.add('robots-txt-noindex-internal-search-pages');
techSpokes.add('fix-internal-external-4xx-errors');
techSpokes.add('html-document-over-2mb-googlebot');
techSpokes.add('high-external-outlinks-seo-audit');
techSpokes.add('website-security-headers-local-business');
updatedClusters['technical-schema'].spokeSlugs = Array.from(techSpokes);

const webSpokes = new Set(updatedClusters['web-architecture'].spokeSlugs);
webSpokes.add('improve-thin-content-readability-service-pages');
updatedClusters['web-architecture'].spokeSlugs = Array.from(webSpokes);

// Generate updated TypeScript code
const tsOutput = `export interface BlogAuthor {
  name: string;
  role: string;
  avatar: string;
}

export interface BlogSection {
  type: 'paragraph' | 'heading' | 'bullet-list' | 'numbered-list' | 'alert-box' | 'quote' | 'micro-tool';
  content: string;
  items?: string[];
  toolConfig?: {
    toolType: 'h1-scanner' | 'breadcrumb-schema' | 'meta-length' | 'opengraph' | 'alt-tag' | 'canonical' | 'cls-simulator' | 'llms-generator' | 'nap-formatter' | 'lsa-calculator' | 'pagespeed-scanner' | 'gbp-inspector';
    toolTitle: string;
    toolDescription: string;
    placeholderUrl: string;
    checkCriteria: string[];
  };
}

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  author: BlogAuthor;
  date: string;
  readTime: string;
  image: string;
  description: string;
  sections: BlogSection[];
}

export interface TopicCluster {
  id: string;
  name: string;
  pillarSlug: string;
  spokeSlugs: string[];
  description: string;
  crossLinkSlug: string;
  crossLinkLabel: string;
}

export const TOPIC_CLUSTERS: Record<string, TopicCluster> = ${JSON.stringify(updatedClusters, null, 2)};

export function getClusterForPost(postSlug: string): { cluster: TopicCluster; role: 'pillar' | 'spoke' } | null {
  for (const cluster of Object.values(TOPIC_CLUSTERS)) {
    if (cluster.pillarSlug === postSlug) {
      return { cluster, role: 'pillar' };
    }
    if (cluster.spokeSlugs.includes(postSlug)) {
      return { cluster, role: 'spoke' };
    }
  }
  return null;
}

export const BLOG_POSTS: BlogPost[] = ${JSON.stringify(mergedPosts, null, 2)};
`;

fs.writeFileSync(targetBlogDataPath, tsOutput, 'utf8');

console.log(`Successfully merged blogs! Updated: ${updatedCount}, New: ${newCount}, Total: ${mergedPosts.length}`);
