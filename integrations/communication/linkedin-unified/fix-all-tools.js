const fs = require('fs');
const path = require('path');

// Fix all tool files
const toolFiles = [
  'src/tools/people-tools.ts',
  'src/tools/job-tools.ts',
  'src/tools/messaging-tools.ts',
  'src/tools/feed-tools.ts',
  'src/tools/company-tools.ts'
];

toolFiles.forEach(file => {
  console.log(`Fixing ${file}...`);
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix 1: Update MCP import
  content = content.replace(
    /from '@modelcontextprotocol\/sdk\/server\/mcp\.js'/g,
    "from '@modelcontextprotocol/sdk/server/index.js'"
  );
  
  // Fix 2: Add proper handler types
  content = content.replace(
    /async \(params, \{ tenantId \}\) => \{/g,
    'async (params: any, { tenantId }: { tenantId: string }) => {'
  );
  
  // Fix 3: Fix error type casting
  content = content.replace(
    /\$\{error\.message\}/g,
    '${(error as Error).message}'
  );
  
  fs.writeFileSync(file, content);
  console.log(`✅ Fixed ${file}`);
});

console.log('All tool files fixed!');
