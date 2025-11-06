export function packageJsonTemplate(config) {
  return JSON.stringify({
    name: config.projectName,
    version: "1.0.0",
    description: "HubSpot OAuth backend on Supabase",
    keywords: [
      "hubspot",
      "oauth",
      "supabase",
      "edge-functions",
      "serverless"
    ],
    license: "MIT",
    devDependencies: {
      supabase: "^1.0.0"
    },
    scripts: {
      setup: "supabase login && supabase link && supabase db push",
      deploy: "supabase db push && supabase functions deploy"
    },
    engines: {
      node: ">=18.0.0"
    }
  }, null, 2);
}

