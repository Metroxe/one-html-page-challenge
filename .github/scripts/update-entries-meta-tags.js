const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Read and parse the original entries.js file to get the metadata
function getOriginalEntries() {
  try {
    const entriesContent = fs.readFileSync('entries.js', 'utf8');
    
    // Extract the entries array using regex
    const entriesMatch = entriesContent.match(/const\s+entries\s*=\s*(\[[\s\S]*?\]);/);
    if (!entriesMatch) {
      throw new Error('Could not find entries array in entries.js');
    }
    
    // Use Function constructor to safely evaluate the array
    const entriesArrayString = entriesMatch[1];
    const entries = new Function('return ' + entriesArrayString)();
    
    return entries;
  } catch (error) {
    console.error('Error reading entries.js:', error.message);
    return [];
  }
}

// Add meta tags to HTML content using surgical string manipulation
function addMetaTags(content, entry) {
  // First check what's missing using cheerio for parsing only
  const $ = cheerio.load(content);
  
  const hasTitle = $('title').length > 0;
  const hasMetaTitle = $('meta[name="title"]').length > 0;
  const hasDescription = $('meta[name="description"]').length > 0;
  const hasAuthor = $('meta[name="author"]').length > 0;
  const hasGithub = $('meta[name="github"]').length > 0;
  const hasCompatibleBrowsers = $('meta[name="compatible-browsers"]').length > 0;
  const hasViewport = $('meta[name="viewport"]').length > 0;
  const hasHead = $('head').length > 0;
  
  // Build list of meta tags to add
  const metaTags = [];
  
  // Add comment explaining the addition
  metaTags.push('    <!-- Meta tags added due to entries.js deprecation on July 8th, 2025 -->');
  
  // Add viewport if missing (best practice)
  if (!hasViewport) {
    metaTags.push('    <meta name="viewport" content="width=device-width, initial-scale=1.0">');
  }
  
  // Don't add title meta tag if title element exists
  if (entry.title && !hasTitle && !hasMetaTitle) {
    metaTags.push(`    <meta name="title" content="${escapeHtml(entry.title)}">`);
  }
  
  // Add description if missing
  if (entry.description && !hasDescription) {
    metaTags.push(`    <meta name="description" content="${escapeHtml(entry.description)}">`);
  }
  
  // Add author if missing
  if (entry.author && !hasAuthor) {
    metaTags.push(`    <meta name="author" content="${escapeHtml(entry.author)}">`);
  }
  
  // Add github if missing
  if (entry.github && !hasGithub) {
    metaTags.push(`    <meta name="github" content="${escapeHtml(entry.github)}">`);
  }
  
  // Add compatible browsers if missing
  if (entry.compatibleBrowsers && entry.compatibleBrowsers.length > 0 && !hasCompatibleBrowsers) {
    const browsers = entry.compatibleBrowsers.join(', ');
    metaTags.push(`    <meta name="compatible-browsers" content="${escapeHtml(browsers)}">`);
  }
  
  // If nothing to add, return original content
  if (metaTags.length <= 1) { // Only comment, no actual meta tags
    return content;
  }
  
  let updatedContent = content;
  
  if (!hasHead) {
    // Create head section after opening html tag or at the beginning
    const htmlTagMatch = updatedContent.match(/(<html[^>]*>)/i);
    if (htmlTagMatch) {
      const insertPos = htmlTagMatch.index + htmlTagMatch[0].length;
      const headSection = `\n<head>\n${metaTags.join('\n')}\n</head>`;
      updatedContent = updatedContent.slice(0, insertPos) + headSection + updatedContent.slice(insertPos);
    } else {
      // No html tag, add head at the beginning
      const headSection = `<head>\n${metaTags.join('\n')}\n</head>\n`;
      updatedContent = headSection + updatedContent;
    }
  } else {
    // Find head tag and insert after it
    const headTagMatch = updatedContent.match(/(<head[^>]*>)/i);
    if (headTagMatch) {
      const insertPos = headTagMatch.index + headTagMatch[0].length;
      const insertion = `\n${metaTags.join('\n')}`;
      updatedContent = updatedContent.slice(0, insertPos) + insertion + updatedContent.slice(insertPos);
    }
  }
  
  return updatedContent;
}

// Simple HTML escape function
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Update all entry files with meta tags
function updateAllEntries() {
  const originalEntries = getOriginalEntries();
  if (originalEntries.length === 0) {
    console.error('No entries found in entries.js');
    return;
  }
  
  console.log(`Found ${originalEntries.length} entries in entries.js`);
  
  let updatedCount = 0;
  let skippedCount = 0;
  
  for (const entry of originalEntries) {
    const filePath = path.join('entries', entry.filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${entry.filename}`);
      continue;
    }
    
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const updatedContent = addMetaTags(originalContent, entry);
      
      // Only write if content changed
      if (originalContent !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✅ Updated: ${entry.filename}`);
        updatedCount++;
      } else {
        console.log(`⏭️  Skipped: ${entry.filename} (already has meta tags)`);
        skippedCount++;
      }
    } catch (error) {
      console.error(`❌ Error updating ${entry.filename}:`, error.message);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Updated: ${updatedCount} files`);
  console.log(`   Skipped: ${skippedCount} files`);
  console.log(`   Total:   ${originalEntries.length} files`);
}

// Run the update
updateAllEntries(); 