export function gitignoreTemplate(config) {
  return `# Supabase
.branches
.temp
.supabase

# Environment variables
.env
.env*.local

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

# Dependencies
node_modules/
`;
}

