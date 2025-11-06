export function dbTemplate(config) {
  if (config.database === 'supabase') {
    return `/**
 * Database Connection - Supabase PostgreSQL
 *
 * Connects to Supabase PostgreSQL database for token storage.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

interface QueryResult {
  rows: any[];
}

export async function getDb(): Promise<{ query: (text: string, params: any[]) => Promise<QueryResult> }> {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }

  // Return a PostgreSQL-like interface for compatibility
  return {
    query: async (text: string, params: any[]): Promise<QueryResult> => {
      const tableName = 'oauth_tokens';

      // Parse SQL query to determine operation
      if (text.toUpperCase().includes('INSERT')) {
        // Extract values from params
        const [portal_id, access_token, refresh_token, expires_at, scopes] = params;

        const { data, error } = await supabaseClient!
          .from(tableName)
          .upsert({
            portal_id,
            access_token,
            refresh_token,
            expires_at,
            scopes,
          }, {
            onConflict: 'portal_id'
          })
          .select();

        if (error) throw error;
        return { rows: data || [] };
      }
      else if (text.toUpperCase().includes('SELECT')) {
        const portal_id = params[0];

        const { data, error } = await supabaseClient!
          .from(tableName)
          .select('*')
          .eq('portal_id', portal_id)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        return { rows: data ? [data] : [] };
      }
      else if (text.toUpperCase().includes('UPDATE')) {
        const [access_token, refresh_token, expires_at, portal_id] = params;

        const { data, error } = await supabaseClient!
          .from(tableName)
          .update({
            access_token,
            refresh_token,
            expires_at,
            updated_at: new Date().toISOString(),
          })
          .eq('portal_id', portal_id)
          .select();

        if (error) throw error;
        return { rows: data || [] };
      }

      throw new Error('Unsupported query type');
    }
  };
}
`;
  } else if (config.database === 'vercel-postgres') {
    return `/**
 * Database Connection - Vercel Postgres
 *
 * Connects to Vercel Postgres database for token storage.
 */

import { sql } from '@vercel/postgres';

interface QueryResult {
  rows: any[];
}

export async function getDb(): Promise<{ query: (text: string, params: any[]) => Promise<QueryResult> }> {
  return {
    query: async (text: string, params: any[]): Promise<QueryResult> => {
      const result = await sql.query(text, params);
      return result as QueryResult;
    }
  };
}
`;
  } else {
    return `/**
 * Database Connection - PostgreSQL
 *
 * Connects to PostgreSQL database for token storage.
 */

import pg from 'pg';
const { Pool } = pg;

let pool: pg.Pool | null = null;

export async function getDb(): Promise<pg.Pool> {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }

  return pool;
}
`;
  }
}
