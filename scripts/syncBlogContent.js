const simpleGit = require('simple-git');
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

const OBSIDIAN_REPO = 'https://github.com/spiralwrks/obsidian.git';
const TEMP_CLONE_DIR = path.join(__dirname, '../.temp-obsidian');
const BLOG_CONTENT_DIR = path.join(__dirname, '../public/content/blog');

async function cloneObsidianRepo() {
  console.log('Starting clone process...');
  console.log('Temp directory:', TEMP_CLONE_DIR);
  console.log('Blog content directory:', BLOG_CONTENT_DIR);
  
  const git = simpleGit();
  try {
    console.log('Cleaning up existing temp directory...');
    await fs.rm(TEMP_CLONE_DIR, { recursive: true, force: true });
    
    console.log('Cloning from:', OBSIDIAN_REPO);
    await git.clone(OBSIDIAN_REPO, TEMP_CLONE_DIR);
    console.log('Clone completed successfully');
  } catch (error) {
    console.error('Error during clone:', error.message);
    throw error;
  }
}

async function findMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async entry => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip .git and other hidden directories
        if (entry.name.startsWith('.')) {
          return [];
        }
        return findMarkdownFiles(fullPath);
      } else if (entry.name.endsWith('.md')) {
        return [fullPath];
      }
      return [];
    })
  );
  
  return files.flat();
}

function createSlug(relativePath) {
  // Remove the .md extension but keep the directory structure
  return relativePath.replace(/\.md$/, '');
}

async function processMarkdownFiles() {
  console.log('Starting markdown processing...');
  
  // Ensure blog content directory exists
  await fs.rm(BLOG_CONTENT_DIR, { recursive: true, force: true });
  await fs.mkdir(BLOG_CONTENT_DIR, { recursive: true });

  // Recursively find all markdown files
  console.log('Searching for markdown files in:', TEMP_CLONE_DIR);
  const mdFiles = await findMarkdownFiles(TEMP_CLONE_DIR);
  console.log('Markdown files found:', mdFiles);

  const processedPosts = [];

  for (const filePath of mdFiles) {
    try {
      console.log('Processing file:', filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      const { data, content: mdContent } = matter(content);
      
      // Create clean paths and slugs
      const relativePath = path.relative(TEMP_CLONE_DIR, filePath);
      const slug = createSlug(relativePath);
      
      if (!slug) {
        console.log('Skipping file with invalid slug:', filePath);
        continue;
      }

      // Create JSON file with metadata and content
      const blogPost = {
        title: data.title || path.basename(filePath, '.md'),
        date: data.date || new Date().toISOString(),
        tags: data.tags || [],
        content: mdContent,
        slug,
        path: relativePath.replace(/\\/g, '/'), // Normalize path separators
      };

      const outputPath = path.join(BLOG_CONTENT_DIR, `${slug}.json`);
      console.log('Writing to:', outputPath);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(
        outputPath,
        JSON.stringify(blogPost, null, 2)
      );

      processedPosts.push({
        title: blogPost.title,
        date: blogPost.date,
        slug: blogPost.slug,
        tags: blogPost.tags,
        path: blogPost.path,
      });
    } catch (error) {
      console.error('Error processing file:', filePath, error);
      // Continue with other files
      continue;
    }
  }

  // Sort posts by path for consistent ordering
  processedPosts.sort((a, b) => a.path.localeCompare(b.path));

  console.log('Writing index file with posts:', processedPosts);
  await fs.writeFile(
    path.join(BLOG_CONTENT_DIR, 'index.json'),
    JSON.stringify(processedPosts, null, 2)
  );

  // Copy any assets (images, etc.) if they exist
  try {
    const assetsDir = path.join(TEMP_CLONE_DIR, '03 imgs');
    const targetAssetsDir = path.join(BLOG_CONTENT_DIR, 'assets');
    
    console.log('Checking for assets directory:', assetsDir);
    const assetsExist = await fs.stat(assetsDir).catch(() => false);
    if (assetsExist) {
      console.log('Copying assets...');
      await fs.mkdir(targetAssetsDir, { recursive: true });
      await fs.cp(assetsDir, targetAssetsDir, { recursive: true });
      console.log('Assets copied successfully');
    }
  } catch (error) {
    console.log('No assets directory found, skipping...');
  }
}

async function cleanup() {
  console.log('Starting cleanup...');
  await fs.rm(TEMP_CLONE_DIR, { recursive: true, force: true });
  console.log('Cleanup completed');
}

async function main() {
  try {
    console.log('=== Starting blog content sync ===');
    await cloneObsidianRepo();
    
    console.log('\n=== Processing markdown files ===');
    await processMarkdownFiles();
    
    console.log('\n=== Cleanup ===');
    await cleanup();
    
    console.log('\n=== Blog content sync completed successfully! ===');
  } catch (error) {
    console.error('\nError syncing blog content:', error);
    process.exit(1);
  }
}

// Run the script
main(); 