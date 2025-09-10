const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const simpleGit = require('simple-git');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const puppeteer = require('puppeteer');
require('dotenv').config();

const OBSIDIAN_REPO = 'https://github.com/spiralwrks/blog.git';
const TEMP_CLONE_DIR = path.join(__dirname, '../.temp-blog');
const BLOG_CONTENT_DIR = path.join(__dirname, '../public/content/blog');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.warn('Warning: GITHUB_TOKEN not found in environment variables. GitHub images will not be downloaded.');
}

async function cloneObsidianRepo() {
  console.log('Starting clone process...');
  console.log('Temp directory:', TEMP_CLONE_DIR);
  console.log('Blog content directory:', BLOG_CONTENT_DIR);
  
  const git = simpleGit();
  try {
    console.log('Cleaning up existing temp directory...');
    await fs.promises.rm(TEMP_CLONE_DIR, { recursive: true, force: true });
    
    console.log('Cloning from:', OBSIDIAN_REPO);
    await git.clone(OBSIDIAN_REPO, TEMP_CLONE_DIR);
    console.log('Clone completed successfully');
  } catch (error) {
    console.error('Error during clone:', error.message);
    throw error;
  }
}

async function downloadGitHubImage(url, targetPath) {
  try {
    console.log(`Downloading GitHub image: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'image/*, */*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    await fs.promises.writeFile(targetPath, Buffer.from(buffer));
    
    console.log(`Successfully downloaded image to: ${targetPath}`);
    return true;
  } catch (error) {
    console.error(`Error downloading image: ${error.message}`);
    return false;
  }
}

async function getAuthenticatedUrl(browser, githubUrl) {
  try {
    console.log(`Getting authenticated URL for: ${githubUrl}`);
    const page = await browser.newPage();
    
    // Set multiple cookies required for GitHub authentication
    const cookies = [
      {
        name: 'user_session',
        value: process.env.GITHUB_USER_SESSION,
        domain: '.github.com',
        path: '/',
        httpOnly: true,
        secure: true
      },
      {
        name: 'logged_in',
        value: 'yes',
        domain: '.github.com',
        path: '/',
        secure: true
      },
      {
        name: 'dotcom_user',
        value: process.env.GITHUB_USERNAME,
        domain: '.github.com',
        path: '/',
        secure: true
      }
    ];
    
    await page.setCookie(...cookies);

    // Set request headers
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
    });

    // Navigate to the GitHub URL with increased timeout
    await page.goto(githubUrl, { 
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    // Wait for the image to load and get its URL
    await page.waitForSelector('img', { timeout: 10000 });
    const imageUrl = await page.evaluate(() => {
      const img = document.querySelector('img');
      return img ? img.src : null;
    });

    if (!imageUrl) {
      throw new Error('Image not found on page');
    }

    await page.close();
    console.log(`Got authenticated URL: ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error(`Error getting authenticated URL: ${error.message}`);
    return null;
  }
}

async function copyAllImages(tempDir, targetAssetsDir) {
  try {
    // Create assets directory if it doesn't exist
    await fs.promises.mkdir(targetAssetsDir, { recursive: true });
    
    // Handle images from the repository's image directory
    const imagesDir = path.join(tempDir, 'imgs');
    if (fs.existsSync(imagesDir)) {
      const files = await fs.promises.readdir(imagesDir);

      for (const file of files) {
        if (file.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
          const sourcePath = path.join(imagesDir, file);
          const targetPath = path.join(targetAssetsDir, file);

          await fs.promises.copyFile(sourcePath, targetPath);
          console.log(`Copied repository image: ${file}`);
        }
      }
    }

    // Handle embedded images (Pasted images) from each markdown directory
    const dirs = await fs.promises.readdir(tempDir, { withFileTypes: true });
    for (const dir of dirs) {
      if (dir.isDirectory() && !dir.name.startsWith('.')) {
        const dirPath = path.join(tempDir, dir.name);
        const files = await fs.promises.readdir(dirPath);
        
        for (const file of files) {
          if (file.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
            const sourcePath = path.join(dirPath, file);
            const targetPath = path.join(targetAssetsDir, file);
            
            await fs.promises.copyFile(sourcePath, targetPath);
            console.log(`Copied embedded image: ${file}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error copying images:', error);
  }
}

async function processMarkdownContent(browser, content, targetAssetsDir, currentDir, tempDirRoot) {
  let processedContent = content;
  
  // 1. Process GitHub asset URLs from blog repository
  const githubAssetRegex = /!\[(.*?)\]\((https:\/\/github\.com\/spiralwrks\/blog\/raw\/[^\/]+\/imgs\/[^)]+)\)/g;
  let match;
  
  while ((match = githubAssetRegex.exec(content)) !== null) {
    const [fullMatch, altText, githubUrl] = match;
    const urlParts = githubUrl.split('/');
    const filename = `${urlParts[urlParts.length - 2]}-${urlParts[urlParts.length - 1]}.png`;
    const localPath = path.join(targetAssetsDir, filename);
    const relativeLocalPath = `/content/blog/assets/${filename}`;
    
    try {
      console.log(`Processing GitHub image: ${githubUrl}`);
      const authenticatedUrl = await getAuthenticatedUrl(browser, githubUrl);
      
      if (authenticatedUrl && await downloadGitHubImage(authenticatedUrl, localPath)) {
        processedContent = processedContent.replace(
          fullMatch,
          `![${altText}](${relativeLocalPath})`
        );
        console.log(`Successfully processed GitHub image: ${githubUrl}`);
      }
    } catch (error) {
      console.error(`Error processing GitHub image ${githubUrl}:`, error.message);
    }
  }
  
  // 2. Process Obsidian-style image references ![[image.png|300]]
  const obsidianImageRegex = /!\[\[(.*?)\|(.*?)\]\]/g;
  while ((match = obsidianImageRegex.exec(content)) !== null) {
    const [fullMatch, imagePath, width] = match;
    const imageFilename = path.basename(imagePath);
    const relativeLocalPath = `/content/blog/assets/${imageFilename}`;

    // Copy the image if it exists in the imgs directory or current directory
    const sourceOptions = [
      path.join(tempDirRoot, 'imgs', imageFilename),
      path.join(currentDir, imageFilename),
      path.join(currentDir, 'imgs', imageFilename)
    ];

    let copied = false;
    for (const sourcePath of sourceOptions) {
      try {
        if (fs.existsSync(sourcePath)) {
          const targetPath = path.join(targetAssetsDir, imageFilename);
          await fs.promises.copyFile(sourcePath, targetPath);
          console.log(`Copied Obsidian image: ${imageFilename}`);
          copied = true;
          break;
        }
      } catch (error) {
        console.error(`Error checking/copying Obsidian image ${sourcePath}:`, error.message);
      }
    }

    // Replace the Obsidian format with standard markdown
    processedContent = processedContent.replace(
      fullMatch,
      `![${imageFilename}](${relativeLocalPath})`
    );
    console.log(`Updated reference for Obsidian image: ${imageFilename}`);
  }

  // 3. Process Obsidian-style image references without width ![[image.png]]
  const obsidianImageSimpleRegex = /!\[\[([^|]+?)\]\]/g;
  while ((match = obsidianImageSimpleRegex.exec(content)) !== null) {
    const [fullMatch, imagePath] = match;
    const imageFilename = path.basename(imagePath);
    const relativeLocalPath = `/content/blog/assets/${imageFilename}`;

    // Copy the image if it exists in the imgs directory or current directory
    const sourceOptions = [
      path.join(tempDirRoot, 'imgs', imageFilename),
      path.join(currentDir, imageFilename),
      path.join(currentDir, 'imgs', imageFilename)
    ];

    let copied = false;
    for (const sourcePath of sourceOptions) {
      try {
        if (fs.existsSync(sourcePath)) {
          const targetPath = path.join(targetAssetsDir, imageFilename);
          await fs.promises.copyFile(sourcePath, targetPath);
          console.log(`Copied Obsidian image: ${imageFilename}`);
          copied = true;
          break;
        }
      } catch (error) {
        console.error(`Error checking/copying Obsidian image ${sourcePath}:`, error.message);
      }
    }

    // Replace the Obsidian format with standard markdown
    processedContent = processedContent.replace(
      fullMatch,
      `![${imageFilename}](${relativeLocalPath})`
    );
    console.log(`Updated reference for Obsidian image: ${imageFilename}`);
  }

  // 4. Process standard markdown image references
  const localImageRegex = /!\[(.*?)\]\(((?!https?:\/\/)[^)]+\.(png|jpg|jpeg|gif|svg))\)/gi;
  while ((match = localImageRegex.exec(content)) !== null) {
    const [fullMatch, altText, imagePath] = match;
    const imageFilename = path.basename(imagePath);
    const relativeLocalPath = `/content/blog/assets/${imageFilename}`;

    // Copy the image if it exists in the current directory
    const sourcePath = path.join(currentDir, imageFilename);
    const targetPath = path.join(targetAssetsDir, imageFilename);

    try {
      if (fs.existsSync(sourcePath)) {
        await fs.promises.copyFile(sourcePath, targetPath);
        console.log(`Copied local image: ${imageFilename}`);
      }
    } catch (error) {
      console.error(`Error copying local image ${imageFilename}:`, error.message);
    }

    // Replace the local path with the new public path
    processedContent = processedContent.replace(
      fullMatch,
      `![${altText}](${relativeLocalPath})`
    );
    console.log(`Updated reference for local image: ${imageFilename}`);
  }
  
  return processedContent;
}

async function processMarkdownFiles(tempDir, targetDir) {
  const targetAssetsDir = path.join(targetDir, 'public/content/blog/assets');
  const posts = [];
  
  // First copy all local images
  await copyAllImages(tempDir, targetAssetsDir);
  
  // Launch browser for authenticated URLs
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    timeout: 60000
  });
  
  try {
    // First process the root README.md
    const readmePath = path.join(tempDir, 'README.md');
    if (fs.existsSync(readmePath)) {
      const content = await fs.promises.readFile(readmePath, 'utf8');
      const { data, content: mdContent } = matter(content);
      
      // Process content to handle all types of images
      const processedContent = await processMarkdownContent(
        browser,
        mdContent,
        targetAssetsDir,
        tempDir,
        tempDir
      );
      
      // Save README.json at the root only
      const rootReadmePath = path.join(targetDir, 'public/content/blog', 'README.json');
      await fs.promises.writeFile(rootReadmePath, JSON.stringify({
        title: "README",
        date: new Date().toISOString(),
        content: processedContent,
        category: "",
        tags: [],
        slug: "readme",
        path: "README",
        isReadme: true
      }, null, 2));
      
      // Add README to the beginning of posts array
      posts.push({
        title: "README",
        date: new Date().toISOString(),
        category: "",
        tags: [],
        slug: "readme",
        path: "README",
        preview: processedContent.substring(0, 200) + '...',
        isReadme: true
      });
    }
    
    // Then process all other markdown files
    const files = await fs.promises.readdir(tempDir, { withFileTypes: true });

    // Process markdown files in the root directory
    for (const file of files) {
      if (file.isFile() && file.name.endsWith('.md') && file.name !== 'README.md') {
        const mdPath = path.join(tempDir, file.name);
        const content = await fs.promises.readFile(mdPath, 'utf8');
        const { data, content: mdContent } = matter(content);

        // Process content to handle all types of images
        const processedContent = await processMarkdownContent(
          browser,
          mdContent,
          targetAssetsDir,
          tempDir,
          tempDir
        );

        // Generate a URL-friendly slug
        const slug = file.name
          .replace('.md', '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Create the post path using the file name
        const postPath = file.name.replace('.md', '');

        const post = {
          title: file.name.replace('.md', ''),
          date: data.date || new Date().toISOString(),
          content: processedContent,
          category: "main",
          tags: data.tags || [],
          slug,
          path: postPath
        };

        // Save post in the main category directory
        const targetPath = path.join(targetDir, 'public/content/blog', 'main');
        await fs.promises.mkdir(targetPath, { recursive: true });
        const jsonPath = path.join(targetPath, `${slug}.json`);
        await fs.promises.writeFile(jsonPath, JSON.stringify(post, null, 2));

        // Add to posts array for index
        const indexPost = {
          title: post.title,
          date: post.date,
          category: post.category,
          tags: post.tags,
          slug: post.slug,
          path: post.path,
          preview: post.content.substring(0, 200) + '...'
        };
        posts.push(indexPost);

        console.log(`Processed root file: ${file.name}`);
      }
    }

    // Process markdown files in subdirectories
    for (const file of files) {
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'imgs') {
        const dirPath = path.join(tempDir, file.name);
        const dirFiles = await fs.promises.readdir(dirPath);

        for (const mdFile of dirFiles) {
          if (mdFile.endsWith('.md')) {
            const mdPath = path.join(dirPath, mdFile);
            const content = await fs.promises.readFile(mdPath, 'utf8');
            const { data, content: mdContent } = matter(content);

            // Process content to handle all types of images
            const processedContent = await processMarkdownContent(
              browser,
              mdContent,
              targetAssetsDir,
              dirPath,
              tempDir
            );

            // Generate a URL-friendly slug
            const slug = mdFile
              .replace('.md', '')
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');

            // Create the post path using the directory structure
            const postPath = `${file.name}/${mdFile.replace('.md', '')}`;

            const post = {
              title: mdFile.replace('.md', ''),
              date: data.date || new Date().toISOString(),
              content: processedContent,
              category: file.name,
              tags: data.tags || [],
              slug,
              path: postPath
            };

            // Save post in its category directory
            const targetPath = path.join(targetDir, 'public/content/blog', file.name);
            await fs.promises.mkdir(targetPath, { recursive: true });
            const jsonPath = path.join(targetPath, `${slug}.json`);
            await fs.promises.writeFile(jsonPath, JSON.stringify(post, null, 2));

            // Add to posts array for index
            const indexPost = {
              title: post.title,
              date: post.date,
              category: post.category,
              tags: post.tags,
              slug: post.slug,
              path: post.path,
              preview: post.content.substring(0, 200) + '...'
            };
            posts.push(indexPost);

            console.log(`Processed: ${mdFile}`);
          }
        }
      }
    }
    
    // Sort posts by date, but keep README at the top
    const readmePost = posts.find(p => p.isReadme);
    const otherPosts = posts.filter(p => !p.isReadme).sort((a, b) => new Date(b.date) - new Date(a.date));
    const sortedPosts = readmePost ? [readmePost, ...otherPosts] : otherPosts;
    
    // Create index file at the root of the blog directory
    const blogDir = path.join(targetDir, 'public/content/blog');
    await fs.promises.mkdir(blogDir, { recursive: true });
    const indexPath = path.join(blogDir, 'index.json');
    await fs.promises.writeFile(indexPath, JSON.stringify(sortedPosts, null, 2));
    console.log('Created index.json with', sortedPosts.length, 'posts');
  } finally {
    await browser.close();
  }
}

async function cleanup() {
  console.log('Starting cleanup...');
  try {
    // Remove README.json from category directories
    const blogDir = path.join(process.cwd(), 'public/content/blog');
    const dirs = await fs.promises.readdir(blogDir, { withFileTypes: true });
    for (const dir of dirs) {
      if (dir.isDirectory() && !dir.name.startsWith('.') && dir.name !== 'assets') {
        const readmePath = path.join(blogDir, dir.name, 'README.json');
        if (fs.existsSync(readmePath)) {
          await fs.promises.unlink(readmePath);
          console.log(`Removed README.json from ${dir.name}`);
        }
      }
    }
    
    // Remove temp directory
    await fs.promises.rm(TEMP_CLONE_DIR, { recursive: true, force: true });
    console.log('Cleanup completed');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

async function main() {
  try {
    if (!process.env.GITHUB_USER_SESSION || !process.env.GITHUB_USERNAME) {
      throw new Error('GITHUB_USER_SESSION and GITHUB_USERNAME are required in environment variables');
    }

    console.log('=== Starting blog content sync ===');
    await cloneObsidianRepo();
    
    console.log('\n=== Processing markdown files ===');
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000
    });
    
    try {
      await processMarkdownFiles(TEMP_CLONE_DIR, process.cwd());
    } finally {
      await browser.close();
    }
    
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