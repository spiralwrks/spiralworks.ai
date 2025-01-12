const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const simpleGit = require('simple-git');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const puppeteer = require('puppeteer');
require('dotenv').config();

const OBSIDIAN_REPO = 'https://github.com/spiralwrks/obsidian.git';
const TEMP_CLONE_DIR = path.join(__dirname, '../.temp-obsidian');
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

async function processMarkdownContent(browser, content, targetAssetsDir) {
  // Match GitHub asset URLs
  const githubAssetRegex = /!\[(.*?)\]\((https:\/\/github\.com\/spiralwrks\/obsidian\/assets\/\d+\/[a-f0-9-]+)\)/g;
  let match;
  let processedContent = content;
  
  while ((match = githubAssetRegex.exec(content)) !== null) {
    const [fullMatch, altText, githubUrl] = match;
    
    // Generate a filename from the GitHub URL
    const urlParts = githubUrl.split('/');
    const filename = `${urlParts[urlParts.length - 2]}-${urlParts[urlParts.length - 1]}.png`;
    const localPath = path.join(targetAssetsDir, filename);
    const relativeLocalPath = `/content/blog/assets/${filename}`;
    
    try {
      // Get authenticated URL and download the image
      console.log(`Processing image: ${githubUrl}`);
      const authenticatedUrl = await getAuthenticatedUrl(browser, githubUrl);
      
      if (authenticatedUrl) {
        const success = await downloadGitHubImage(authenticatedUrl, localPath);
        if (success) {
          // Replace GitHub URL with local path in markdown
          processedContent = processedContent.replace(
            fullMatch,
            `![${altText}](${relativeLocalPath})`
          );
          console.log(`Successfully processed image: ${githubUrl}`);
        } else {
          console.error(`Failed to download image: ${githubUrl}`);
        }
      } else {
        console.error(`Failed to get authenticated URL for: ${githubUrl}`);
      }
    } catch (error) {
      console.error(`Error processing image ${githubUrl}:`, error.message);
      // Keep the original GitHub URL in case of error
      console.log(`Keeping original URL for: ${githubUrl}`);
    }
  }
  
  return processedContent;
}

async function downloadAuthenticatedImages(targetAssetsDir) {
  try {
    // Check if authenticatedUrls.json exists
    const urlsPath = path.join(__dirname, 'authenticatedUrls.json');
    if (!fs.existsSync(urlsPath)) {
      console.log('\nNo authenticatedUrls.json found. Please create it with the authenticated URLs.');
      return;
    }
    
    const urlsContent = await fs.promises.readFile(urlsPath, 'utf8');
    const authenticatedUrls = JSON.parse(urlsContent);
    
    for (const [githubUrl, authenticatedUrl] of Object.entries(authenticatedUrls)) {
      const urlParts = githubUrl.split('/');
      const filename = `${urlParts[urlParts.length - 2]}-${urlParts[urlParts.length - 1]}.png`;
      const localPath = path.join(targetAssetsDir, filename);
      
      console.log(`Downloading image from authenticated URL to: ${localPath}`);
      const response = await fetch(authenticatedUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      await fs.promises.writeFile(localPath, Buffer.from(buffer));
      console.log(`Successfully downloaded image to: ${localPath}`);
    }
  } catch (error) {
    console.error('Error downloading authenticated images:', error);
  }
}

async function copyAllImages(tempDir, targetAssetsDir) {
  try {
    // Create assets directory if it doesn't exist
    await fs.promises.mkdir(targetAssetsDir, { recursive: true });
    
    // Copy images from the Obsidian repo's image directory
    const imagesDir = path.join(tempDir, '03 imgs');
    const files = await fs.promises.readdir(imagesDir);
    
    for (const file of files) {
      const sourcePath = path.join(imagesDir, file);
      const targetPath = path.join(targetAssetsDir, file);
      
      await fs.promises.copyFile(sourcePath, targetPath);
      console.log(`Copied image: ${file}`);
    }
  } catch (error) {
    console.error('Error copying images:', error);
  }
}

async function processMarkdownFiles(tempDir, targetDir) {
  const targetAssetsDir = path.join(targetDir, 'public/content/blog/assets');
  
  // First copy all local images
  await copyAllImages(tempDir, targetAssetsDir);
  
  // Launch browser for authenticated URLs
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    timeout: 60000
  });
  
  try {
    // Process markdown files
    const files = await fs.promises.readdir(tempDir, { withFileTypes: true });
    const posts = [];
    
    for (const file of files) {
      if (file.isDirectory() && !file.name.startsWith('.')) {
        const dirPath = path.join(tempDir, file.name);
        const dirFiles = await fs.promises.readdir(dirPath);
        
        for (const mdFile of dirFiles) {
          if (mdFile.endsWith('.md')) {
            const mdPath = path.join(dirPath, mdFile);
            const content = await fs.promises.readFile(mdPath, 'utf8');
            const { data, content: mdContent } = matter(content);
            
            // Process content to handle GitHub images
            const processedContent = await processMarkdownContent(browser, mdContent, targetAssetsDir);
            
            const post = {
              ...data,
              content: processedContent,
              slug: mdFile.replace('.md', '')
            };
            
            const targetPath = path.join(targetDir, 'public/content/blog', file.name);
            await fs.promises.mkdir(targetPath, { recursive: true });
            
            const jsonPath = path.join(targetPath, `${post.slug}.json`);
            await fs.promises.writeFile(jsonPath, JSON.stringify(post, null, 2));
            
            posts.push(post);
            console.log(`Processed: ${mdFile}`);
          }
        }
      }
    }
    
    // Create index file
    const index = posts.map(({ title, date, slug }) => ({ title, date, slug }));
    const indexPath = path.join(targetDir, 'public/content/blog/index.json');
    await fs.promises.writeFile(indexPath, JSON.stringify(index, null, 2));
  } finally {
    // Close browser
    await browser.close();
  }
}

async function cleanup() {
  console.log('Starting cleanup...');
  try {
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
    
    console.log('\n=== Downloading authenticated images ===');
    const targetAssetsDir = path.join(process.cwd(), 'public/content/blog/assets');
    await downloadAuthenticatedImages(targetAssetsDir);
    
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