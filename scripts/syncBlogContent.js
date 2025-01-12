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

async function findFiles(dir, predicate) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async entry => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip .git and other hidden directories
        if (entry.name.startsWith('.')) {
          return [];
        }
        return findFiles(fullPath, predicate);
      } else if (predicate(entry.name)) {
        return [fullPath];
      }
      return [];
    })
  );
  
  return files.flat();
}

const findMarkdownFiles = (dir) => findFiles(dir, name => name.endsWith('.md'));

const isImageFile = (name) => {
  const lowerName = name.toLowerCase();
  // First check for UUID pattern
  if (/^[a-f0-9-]{36}$/.test(name)) return true;
  
  // Then check for standard image extensions
  return (
    lowerName.endsWith('.png') ||
    lowerName.endsWith('.jpg') ||
    lowerName.endsWith('.jpeg') ||
    lowerName.endsWith('.gif') ||
    lowerName.endsWith('.svg') ||
    lowerName.endsWith('.webp')
  );
};

function createSlug(relativePath) {
  // Remove the .md extension but keep the directory structure
  return relativePath.replace(/\.md$/, '');
}

async function getFileType(filePath) {
  try {
    // Read the first few bytes of the file
    const fd = await fs.open(filePath, 'r');
    const buffer = Buffer.alloc(8);
    await fd.read(buffer, 0, 8, 0);
    await fd.close();

    // Check file signatures
    if (buffer[0] === 0x89 && buffer[1] === 0x50) return '.png';
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) return '.jpg';
    if (buffer[0] === 0x47 && buffer[1] === 0x49) return '.gif';
    if (buffer.toString('ascii', 0, 4) === '<svg') return '.svg';
    
    // Default to png if we can't determine the type
    return '.png';
  } catch (error) {
    console.error('Error reading file type:', error);
    return '.png';
  }
}

async function findAllImages(dir) {
  const images = new Set();
  
  // Function to recursively search for images
  const searchDir = async (currentDir) => {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        await searchDir(fullPath);
      } else if (isImageFile(entry.name)) {
        images.add(fullPath);
      }
    }
  };

  await searchDir(dir);
  return Array.from(images);
}

async function getUuidMapping() {
  try {
    // Try to read the .obsidian/plugins/obsidian-local-images/data.json file
    const dataPath = path.join(TEMP_CLONE_DIR, '.obsidian', 'plugins', 'obsidian-local-images', 'data.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    const mapping = JSON.parse(data);
    return mapping;
  } catch (error) {
    console.log('No UUID mapping found, will try to infer from content');
    return {};
  }
}

async function copyAllImages() {
  console.log('Copying images...');
  const targetAssetsDir = path.join(BLOG_CONTENT_DIR, 'assets');
  await fs.mkdir(targetAssetsDir, { recursive: true });

  // Find all image files recursively
  const imageFiles = await findAllImages(TEMP_CLONE_DIR);
  console.log('Found images:', imageFiles);

  // Try to get UUID mapping from Obsidian
  const uuidMapping = await getUuidMapping();

  const imageMap = new Map(); // Store original filename to new filename mapping

  for (const imagePath of imageFiles) {
    try {
      const filename = path.basename(imagePath);
      const targetPath = path.join(targetAssetsDir, filename);
      console.log(`Copying image: ${filename}`);
      await fs.copyFile(imagePath, targetPath);
      
      // Store the mapping
      imageMap.set(filename, filename);

      // If this is a pasted image, try to find its UUID from the content
      if (filename.startsWith('Pasted image ')) {
        // We'll handle the UUID mapping when processing content
        console.log(`Stored pasted image: ${filename}`);
      }
    } catch (error) {
      console.error('Error copying image:', imagePath, error);
    }
  }

  return imageMap;
}

function processImagePaths(content, imageMap) {
  let processedContent = content;

  // Handle GitHub asset URLs and local image references
  processedContent = processedContent.replace(
    /!\[(.*?)\]\((.*?)\)/g,
    (match, alt, imagePath) => {
      // Skip external URLs that aren't GitHub assets
      if (imagePath.startsWith('http') && !imagePath.includes('github.com')) {
        return match;
      }

      // For GitHub assets, find corresponding local image
      if (imagePath.includes('github.com')) {
        const localImage = Array.from(imageMap.keys())
          .find(name => name.startsWith('Pasted image '));
        if (localImage) {
          return `![${alt}](assets/${localImage})`;
        }
        return match;
      }

      // For local images, ensure consistent path format
      const filename = path.basename(imagePath);
      const mappedFilename = imageMap.get(filename) || filename;
      return `![${alt}](assets/${mappedFilename})`;
    }
  );

  return processedContent;
}

async function processMarkdownFiles() {
  console.log('Starting markdown processing...');
  
  // Ensure blog content directory exists
  await fs.rm(BLOG_CONTENT_DIR, { recursive: true, force: true });
  await fs.mkdir(BLOG_CONTENT_DIR, { recursive: true });

  // Copy all images first and get the filename mapping
  const imageMap = await copyAllImages();

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

      // Process image paths in the content using the image map
      const processedContent = processImagePaths(mdContent, imageMap);

      // Create JSON file with metadata and content
      const blogPost = {
        title: data.title || path.basename(filePath, '.md'),
        date: data.date || new Date().toISOString(),
        tags: data.tags || [],
        content: processedContent,
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