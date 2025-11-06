export function denoJsonTemplate(config) {
  return JSON.stringify({
    "imports": {
      "npm:@supabase/supabase-js@2": "https://esm.sh/@supabase/supabase-js@2.39.0"
    }
  }, null, 2);
}

