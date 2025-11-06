export function packageJsonTemplate(config) {
  const dependencies = {};

  // Always include TypeScript dependencies
  const devDependencies = {
    "@vercel/node": "^3.0.0",
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0"
  };

  // Add database-specific dependencies
  if (config.database === 'vercel-postgres') {
    dependencies["@vercel/postgres"] = "^0.5.1";
  } else if (config.database === 'supabase') {
    dependencies["@supabase/supabase-js"] = "^2.39.0";
  } else if (config.database === 'postgres') {
    dependencies["pg"] = "^8.11.3";
    devDependencies["@types/pg"] = "^8.10.0";
  }

  return JSON.stringify({
    name: config.projectName,
    version: "1.0.0",
    description: "HubSpot OAuth backend on Vercel (TypeScript)",
    type: "module",
    scripts: {
      "dev": "vercel dev",
      "deploy": "vercel --prod"
    },
    dependencies,
    devDependencies,
    engines: {
      node: ">=18.0.0"
    },
    keywords: [
      "hubspot",
      "oauth",
      "vercel",
      "serverless",
      "typescript"
    ],
    license: "MIT"
  }, null, 2);
}

