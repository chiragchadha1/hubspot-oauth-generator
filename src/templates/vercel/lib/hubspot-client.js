export function hubspotClientTemplate(config) {
  return `/**
 * HubSpot API Client with OAuth Token Management
 *
 * Automatically handles OAuth token retrieval, caching, and refresh.
 * Stores tokens in database and refreshes them when expired.
 */

import { getDb } from './db.js';

interface HubSpotClientOptions {
  portalId: number;
}

export class HubSpotClient {
  private portalId: number;
  private accessToken: string | null;
  private tokenExpiry: Date | null;

  constructor({ portalId }: HubSpotClientOptions) {
    this.portalId = portalId;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Gets a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Fetch token from database
    const db = await getDb();
    const result = await db.query(
      'SELECT * FROM oauth_tokens WHERE portal_id = $1',
      [this.portalId]
    );

    if (result.rows.length === 0) {
      throw new Error('No OAuth tokens found for this portal');
    }

    const tokenRecord = result.rows[0];
    const expiresAt = new Date(tokenRecord.expires_at);
    const now = new Date();

    // Refresh if expired
    if (now >= expiresAt) {
      await this.refreshToken();
      const newResult = await db.query(
        'SELECT * FROM oauth_tokens WHERE portal_id = $1',
        [this.portalId]
      );

      if (newResult.rows.length === 0) {
        throw new Error('Failed to get refreshed token');
      }

      this.accessToken = newResult.rows[0].access_token;
      this.tokenExpiry = new Date(newResult.rows[0].expires_at);
    } else {
      this.accessToken = tokenRecord.access_token;
      this.tokenExpiry = expiresAt;
    }

    return this.accessToken;
  }

  /**
   * Refreshes the OAuth token using the refresh token
   */
  async refreshToken(): Promise<void> {
    const CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
    const CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;
    const REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI;

    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
      throw new Error('Missing required environment variables');
    }

    const db = await getDb();
    const result = await db.query(
      'SELECT refresh_token FROM oauth_tokens WHERE portal_id = $1',
      [this.portalId]
    );

    if (result.rows.length === 0) {
      throw new Error('No refresh token found');
    }

    const tokenRecord = result.rows[0];

    const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        refresh_token: tokenRecord.refresh_token,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data: any = await response.json();
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);

    // Update tokens in database
    await db.query(
      \`UPDATE oauth_tokens
       SET access_token = $1,
           refresh_token = $2,
           expires_at = $3,
           updated_at = NOW()
       WHERE portal_id = $4\`,
      [data.access_token, data.refresh_token, expiresAt, this.portalId]
    );

    this.accessToken = data.access_token;
    this.tokenExpiry = expiresAt;
  }

  /**
   * Makes an authenticated request to the HubSpot API
   */
  async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const accessToken = await this.getAccessToken();

    const url = endpoint.startsWith('http')
      ? endpoint
      : \`https://api.hubapi.com\${endpoint}\`;

    const headers = {
      'Authorization': \`Bearer \${accessToken}\`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Retry once with refreshed token on 401
    if (response.status === 401) {
      await this.refreshToken();
      const newAccessToken = await this.getAccessToken();

      headers.Authorization = \`Bearer \${newAccessToken}\`;
      return fetch(url, { ...options, headers });
    }

    return response;
  }

  /**
   * Performs a GET request to the HubSpot API
   */
  async get(endpoint: string): Promise<any> {
    const response = await this.request(endpoint);
    return response.json();
  }

  /**
   * Performs a POST request to the HubSpot API
   */
  async post(endpoint: string, body: any): Promise<any> {
    const response = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return response.json();
  }

  /**
   * Performs a PATCH request to the HubSpot API
   */
  async patch(endpoint: string, body: any): Promise<any> {
    const response = await this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.json();
  }

  /**
   * Performs a DELETE request to the HubSpot API
   */
  async delete(endpoint: string): Promise<any> {
    const response = await this.request(endpoint, {
      method: 'DELETE',
    });
    return response.json();
  }
}
`;
}
