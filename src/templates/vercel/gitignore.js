export function gitignoreTemplate(config) {
  return `# Dependencies
node_modules/
.pnp
.pnp.js

# Environment variables
.env
.env*.local

# Vercel
.vercel

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
*.swp
*.swo
*~

# IDE
.idea/
.vscode/
*.sublime-*

# Testing
coverage/
.nyc_output/
`;
}

