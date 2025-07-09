const fs = require('fs');
const { Octokit } = require('@octokit/rest');

// Get environment variables
const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY.split('/');
const owner = repo[0];
const repoName = repo[1];
const prNumber = process.env.PR_NUMBER;
const isDryRun = process.env.DRY_RUN === 'true';

if (!token) {
  console.error('GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

if (!prNumber) {
  console.error('PR_NUMBER environment variable is required');
  process.exit(1);
}

const octokit = new Octokit({ auth: token });

async function commentOnPR() {
  try {
    let results = {};
    let hasErrors = false;
    
    if (fs.existsSync('validation-results.json')) {
      results = JSON.parse(fs.readFileSync('validation-results.json', 'utf8'));
      hasErrors = Object.values(results).some(issues => issues.length > 0);
    }
    
    // Determine overall status
    const status = hasErrors ? '🚫 Entry Validation Failed' : '✅ Entry Validation Passed';
    let comment = `## ${status}\n\n`;
    
    // Add requirements checklist
    comment += '### Requirements Checklist:\n\n';
    
    // Check each requirement across all files
    let fileSizePass = true;
    let htmlStructurePass = true;
    let noExternalImportsPass = true;
    let noNetworkRequestsPass = true;
    let htmlSyntaxPass = true;
    let entryRegisteredPass = true;
    
    for (const [file, issues] of Object.entries(results)) {
      issues.forEach(issue => {
        if (issue.includes('File size') && issue.includes('exceeds')) fileSizePass = false;
        if (issue.includes('File must have') || issue.includes('HTML structure')) htmlStructurePass = false;
        if (issue.includes('External') && (issue.includes('stylesheet') || issue.includes('script') || issue.includes('image') || issue.includes('resource'))) noExternalImportsPass = false;
        if (issue.includes('network request')) noNetworkRequestsPass = false;
        if (issue.includes('HTML syntax') || issue.includes('Unclosed')) htmlSyntaxPass = false;
        if (issue.includes('Entry not found') || issue.includes('entries.js')) entryRegisteredPass = false;
      });
    }
    
    comment += `- ${fileSizePass ? '✅' : '❌'} File must be less than 1MB\n`;
    comment += `- ${htmlStructurePass ? '✅' : '❌'} Valid HTML file structure\n`;
    comment += `- ${noExternalImportsPass ? '✅' : '❌'} No external file imports (images, CSS, JS)\n`;
    comment += `- ${noNetworkRequestsPass ? '✅' : '❌'} No network requests\n`;
    comment += `- ${htmlSyntaxPass ? '✅' : '❌'} Valid HTML syntax\n`;
    comment += `- ${entryRegisteredPass ? '✅' : '❌'} Entry registered in entries.js\n\n`;
    
    // Add detailed issues if any exist
    if (hasErrors) {
      comment += '### Issues Found:\n\n';
      for (const [file, issues] of Object.entries(results)) {
        if (issues.length > 0) {
          comment += `**${file}:**\n`;
          issues.forEach(issue => {
            comment += `- ${issue}\n`;
          });
          comment += '\n';
        }
      }
      comment += 'Please fix the issues above and update your pull request.';
    } else {
      comment += 'All entries meet the One HTML Page Challenge requirements! 🎉';
    }
    
    // Log the comment for dry runs or post it
    if (isDryRun) {
      console.log('Dry run mode - comment would be:');
      console.log('---');
      console.log(comment);
      console.log('---');
    } else {
      console.log('Posting comment to PR #' + prNumber);
      await octokit.rest.issues.createComment({
        owner: owner,
        repo: repoName,
        issue_number: parseInt(prNumber),
        body: comment
      });
      console.log('Comment posted successfully');
    }
    
    // Exit with error code if validation failed
    if (hasErrors) {
      process.exit(1);
    } else {
      process.exit(0);
    }
    
  } catch (error) {
    console.error('Error posting comment:', error.message);
    process.exit(1);
  }
}

commentOnPR(); 