const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const cheerio = require('cheerio');

const MAX_FILE_SIZE = 1024 * 1024; // 1MB in bytes
const results = {};

// Validate file size (must be < 1MB)
function validateFileSize(filePath) {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  
  if (fileSizeInBytes >= MAX_FILE_SIZE) {
    return `File size (${(fileSizeInBytes / 1024 / 1024).toFixed(2)}MB) exceeds 1MB limit`;
  }
  
  return null;
}

// Validate that it's a single HTML file
function validateSingleHtmlFile(filePath, content) {
  const issues = [];
  
  // Check file extension
  if (!filePath.match(/\.html?$/i)) {
    issues.push('File must have .html or .htm extension');
  }

  // Check for basic HTML structure
  if (!content.includes('<html') && !content.includes('<!DOCTYPE')) {
    issues.push('File must contain valid HTML structure');
  }

  return issues;
}

// Check if URL is external
function isExternalUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (e) {
    // If URL parsing fails, it's likely a relative path
    return false;
  }
}

// Validate no external file imports
function validateNoExternalImports(content) {
  const issues = [];
  const $ = cheerio.load(content);

  // Check for external stylesheets
  $('link[rel="stylesheet"]').each((i, el) => {
    const href = $(el).attr('href');
    if (href && isExternalUrl(href)) {
      issues.push(`External stylesheet found: ${href}`);
    }
  });

  // Check for external scripts
  $('script[src]').each((i, el) => {
    const src = $(el).attr('src');
    if (src && isExternalUrl(src)) {
      issues.push(`External script found: ${src}`);
    }
  });

  // Check for external images
  $('img[src]').each((i, el) => {
    const src = $(el).attr('src');
    if (src && isExternalUrl(src) && !src.startsWith('data:')) {
      issues.push(`External image found: ${src}`);
    }
  });

  // Check for other external resources
  $('[src], [href]').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('href');
    if (src && isExternalUrl(src) && !src.startsWith('data:') && !src.startsWith('#')) {
      const tagName = el.tagName.toLowerCase();
      if (!['link', 'script', 'img', 'a'].includes(tagName)) {
        issues.push(`External resource found in ${tagName}: ${src}`);
      }
    }
  });

  return issues;
}

// Basic check if match is in comment or string (not perfect but helps)
function isInCommentOrString(content, match) {
  const index = content.indexOf(match);
  if (index === -1) return false;
  
  const beforeMatch = content.substring(0, index);
  const lines = beforeMatch.split('\n');
  const currentLine = lines[lines.length - 1];
  
  // Check if it's in a single-line comment
  if (currentLine.includes('//')) {
    const commentIndex = currentLine.indexOf('//');
    const matchIndex = currentLine.length - (content.length - index);
    if (matchIndex > commentIndex) return true;
  }
  
  // Basic check for strings (not perfect due to nested quotes)
  const inString = (currentLine.match(/"/g) || []).length % 2 === 1 ||
                  (currentLine.match(/'/g) || []).length % 2 === 1;
  
  return inString;
}

// Validate no network requests in JavaScript
function validateNoNetworkRequests(content) {
  const issues = [];
  
  // Common patterns for network requests
  const networkPatterns = [
    /fetch\s*\(/gi,
    /XMLHttpRequest/gi,
    /\.ajax\s*\(/gi,
    /axios\./gi,
    /\$\.get\s*\(/gi,
    /\$\.post\s*\(/gi,
    /new\s+WebSocket\s*\(/gi,
    /navigator\.sendBeacon\s*\(/gi,
    /import\s*\(/gi, // Dynamic imports
  ];

  networkPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Exclude comments and string literals where possible
        if (!isInCommentOrString(content, match)) {
          issues.push(`Potential network request found: ${match.trim()}`);
        }
      });
    }
  });

  return issues;
}

// Validate entry exists in entries.js
function validateEntryInManifest(filename) {
  try {
    const entriesContent = fs.readFileSync('entries.js', 'utf8');
    
    // Extract the entries array
    const entriesMatch = entriesContent.match(/const\s+entries\s*=\s*\[([\s\S]*?)\];/);
    if (!entriesMatch) {
      return ['Could not parse entries.js file'];
    }

    // Check if filename exists in the entries
    if (!entriesContent.includes(`"${filename}"`)) {
      return [`Entry not found in entries.js. Please add an entry for ${filename}`];
    }
    
    return [];
  } catch (error) {
    return [`Error reading entries.js: ${error.message}`];
  }
}

// Validate HTML syntax and structure
function validateHtmlSyntax(content) {
  const issues = [];
  
  try {
    const dom = new JSDOM(content);
    // If JSDOM can parse it, it's likely valid HTML
  } catch (error) {
    issues.push(`HTML syntax error: ${error.message}`);
  }

  // Check for unclosed script tags
  const scriptMatches = content.match(/<script[^>]*>/gi) || [];
  const scriptCloses = content.match(/<\/script>/gi) || [];
  
  if (scriptMatches.length !== scriptCloses.length) {
    issues.push('Unclosed script tags detected');
  }

  // Check for unclosed style tags
  const styleMatches = content.match(/<style[^>]*>/gi) || [];
  const styleCloses = content.match(/<\/style>/gi) || [];
  
  if (styleMatches.length !== styleCloses.length) {
    issues.push('Unclosed style tags detected');
  }

  return issues;
}

// Main validation function
function validateEntry(filePath) {
  const issues = [];
  const filename = path.basename(filePath);
  
  console.log(`Validating: ${filename}`);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return [`File does not exist: ${filePath}`];
  }

  // Read file content
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return [`Error reading file: ${error.message}`];
  }

  // 1. Validate file size
  const sizeIssue = validateFileSize(filePath);
  if (sizeIssue) issues.push(sizeIssue);

  // 2. Validate single HTML file
  issues.push(...validateSingleHtmlFile(filePath, content));

  // 3. Validate HTML syntax
  issues.push(...validateHtmlSyntax(content));

  // 4. Validate no external imports
  issues.push(...validateNoExternalImports(content));

  // 5. Validate no network requests
  issues.push(...validateNoNetworkRequests(content));

  // 6. Validate entry exists in entries.js
  issues.push(...validateEntryInManifest(filename));

  return issues;
}

// Run validation on all changed files
function validateChangedFiles() {
  const changedFiles = process.env.CHANGED_FILES ? process.env.CHANGED_FILES.trim().split(' ') : [];
  
  console.log('Changed files:', changedFiles);
  
  let hasErrors = false;

  for (const file of changedFiles) {
    if (!file) continue;
    
    if (file.startsWith('entries/') && file.match(/\.html?$/)) {
      const issues = validateEntry(file);
      results[file] = issues;
      
      if (issues.length > 0) {
        hasErrors = true;
        console.log(`❌ ${file}: ${issues.length} issues found`);
        issues.forEach(issue => console.log(`   - ${issue}`));
      } else {
        console.log(`✅ ${file}: No issues found`);
      }
    }
  }

  // Write results for GitHub Action to use
  fs.writeFileSync('validation-results.json', JSON.stringify(results, null, 2));

  if (hasErrors) {
    console.log('\n❌ Validation failed');
    process.exit(1);
  } else {
    console.log('\n✅ All validations passed');
    process.exit(0);
  }
}

// Run validation
validateChangedFiles(); 