export function vercelJsonTemplate(config) {
  return JSON.stringify({
    version: 2,
    functions: {
      "api/**/*.js": {
        runtime: "nodejs20.x"
      }
    },
    env: {
      HUBSPOT_CLIENT_ID: "@hubspot_client_id",
      HUBSPOT_CLIENT_SECRET: "@hubspot_client_secret",
      HUBSPOT_REDIRECT_URI: "@hubspot_redirect_uri"
    }
  }, null, 2);
}

