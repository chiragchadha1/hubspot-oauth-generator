export function configTomlTemplate(config) {
  return `# Supabase Configuration

[functions]
# Timeout in seconds
timeout = 30

# Function runtime
runtime = "deno"
`;
}

