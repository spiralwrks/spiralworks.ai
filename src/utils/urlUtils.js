/**
 * URL utility functions for blog post slugs
 */

/**
 * Convert a string path to a URL-friendly slug
 * @param {string} path - The path or title to convert
 * @returns {string} URL-friendly slug
 */
export const formatSlug = (path) => {
  if (!path) return '';

  // Store the original directory structure
  // Mark directory separators with a special pattern that won't get replaced
  const markedPath = path.replace(/\//g, '__DIR_SEP__');

  // Replace spaces and special characters with hyphens
  return markedPath
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/%20/g, '-')           // Replace %20 with hyphens
    .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace other special chars with hyphens
    .replace(/-{2,}/g, '-')         // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '')        // Remove leading/trailing hyphens
    .replace(/__DIR_SEP__/g, '-')   // Replace our directory marker with hyphens
    .toLowerCase();                  // Convert to lowercase
};

/**
 * Store original path mapping for accurate path reconstruction
 * This helps with case sensitivity and special characters
 */
const pathMap = new Map();

/**
 * Register an original path in the map for later lookup
 * @param {string} originalPath - The original path
 * @param {string} slug - The formatted slug
 */
export const registerPath = (originalPath, slug) => {
  if (originalPath && slug) {
    pathMap.set(slug.toLowerCase(), originalPath);
  }
};

/**
 * Convert a URL-friendly slug back to the original path format
 * @param {string} slug - The URL slug to convert
 * @returns {string} Original path format
 */
export const unformatSlug = (slug) => {
  if (!slug) return '';

  // Check if this is an already encoded URL (old format)
  if (slug.includes('%20')) {
    return decodeURIComponent(slug);
  }

  // First check our path map for an exact match
  const lowercaseSlug = slug.toLowerCase();
  if (pathMap.has(lowercaseSlug)) {
    return pathMap.get(lowercaseSlug);
  }


  // Reconstruct directory structure
  // In our blog structure, first part is usually a directory
  const parts = slug.split('-');

  // Try to identify likely directory break points based on numbering patterns
  // e.g. "01-foundational-research-leaves..." -> "01 foundational research/Leaves..."
  let result = '';
  let dirPartFound = false;

  for (let i = 0; i < parts.length; i++) {
    // If it looks like a numbered directory and we haven't found the dir part yet
    if (!dirPartFound && parts[i].match(/^\d+$/)) {
      result += parts[i] + ' ';

      // Add the next few parts to the directory name
      let j = i + 1;
      while (j < parts.length && j < i + 4) {
        result += parts[j] + ' ';
        j++;
      }

      // Mark the directory as found and add separator
      dirPartFound = true;
      result = result.trim() + '/';

      // Skip the parts we've already added
      i = j - 1;
    } else if (i > 0) {
      // For non-directory parts, capitalize first letter of each word for title case
      const capitalized = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
      result += capitalized + ' ';
    } else {
      result += parts[i] + ' ';
    }
  }

  return result.trim();
};