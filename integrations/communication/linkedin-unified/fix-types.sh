#!/bin/bash
# Comprehensive type fixing script

cd "$(dirname "$0")"

echo "Fixing TypeScript type errors..."

# Fix 1: Update tsconfig.json to include DOM libs for Playwright evaluations
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "types": ["node", "jest"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
EOF

echo "✅ Updated tsconfig.json with DOM types"

# Fix 2: Update unified-client sendMessage to accept 2 params (not object)
# Already fixed in previous edit

# Fix 3: Add missing method signatures
echo "✅ UnifiedClient interface already updated"

# Done
echo "✅ All type fixes applied"
echo "Run 'npm run build' to test compilation"
