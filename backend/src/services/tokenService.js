import axios from 'axios';
import { query } from '../config/db.js';
import 'dotenv/config';

const GRAPH_URL = 'https://graph.facebook.com/v18.0';

/**
 * Retrieve stored Meta tokens for a user.
 * Returns null if no tokens are saved yet.
 */
export async function getTokensByUserId(userId) {
  const { rows } = await query(
    'SELECT * FROM meta_tokens WHERE user_id = $1 LIMIT 1',
    [userId]
  );
  return rows[0] || null;
}

/**
 * Upsert Meta tokens for a user.
 * @param {string} userId
 * @param {object} data  Fields: user_access_token, token_expires_at, page_id,
 *                       page_name, page_access_token, ig_user_id, ig_username, scopes
 */
export async function saveTokens(userId, data) {
  const {
    user_access_token,
    token_expires_at,
    page_id,
    page_name,
    page_access_token,
    ig_user_id,
    ig_username,
    scopes,
  } = data;

  const { rows } = await query(
    `INSERT INTO meta_tokens
       (user_id, user_access_token, token_expires_at, page_id, page_name,
        page_access_token, ig_user_id, ig_username, scopes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (user_id) DO UPDATE SET
       user_access_token = EXCLUDED.user_access_token,
       token_expires_at  = EXCLUDED.token_expires_at,
       page_id           = EXCLUDED.page_id,
       page_name         = EXCLUDED.page_name,
       page_access_token = EXCLUDED.page_access_token,
       ig_user_id        = EXCLUDED.ig_user_id,
       ig_username       = EXCLUDED.ig_username,
       scopes            = EXCLUDED.scopes,
       updated_at        = NOW()
     RETURNING *`,
    [
      userId,
      user_access_token,
      token_expires_at || null,
      page_id || null,
      page_name || null,
      page_access_token || null,
      ig_user_id || null,
      ig_username || null,
      scopes || [],
    ]
  );
  return rows[0];
}

/**
 * Exchange a short-lived token for a long-lived one (60 days).
 */
export async function exchangeForLongLivedToken(shortLivedToken) {
  const url = `${GRAPH_URL}/oauth/access_token`;
  const params = {
    grant_type:        'fb_exchange_token',
    client_id:         process.env.META_APP_ID,
    client_secret:     process.env.META_APP_SECRET,
    fb_exchange_token: shortLivedToken,
  };

  const { data } = await axios.get(url, { params });
  // data = { access_token, token_type, expires_in }
  return data;
}

/**
 * Refresh the stored token if it will expire within the next 7 days.
 * Returns the (possibly refreshed) token record.
 */
export async function refreshTokenIfNeeded(userId) {
  const tokens = await getTokensByUserId(userId);
  if (!tokens) {
    throw new Error('No Meta tokens found for user');
  }

  if (!tokens.token_expires_at) {
    // Token has no expiry (non-expiring page token) – nothing to do
    return tokens;
  }

  const expiresAt = new Date(tokens.token_expires_at);
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (expiresAt > sevenDaysFromNow) {
    // Token still fresh
    return tokens;
  }

  console.log(`[tokenService] Refreshing token for user ${userId}`);
  try {
    const refreshed = await exchangeForLongLivedToken(tokens.user_access_token);

    const newExpiry = refreshed.expires_in
      ? new Date(Date.now() + refreshed.expires_in * 1000)
      : null;

    const updated = await saveTokens(userId, {
      ...tokens,
      user_access_token: refreshed.access_token,
      token_expires_at:  newExpiry,
    });
    return updated;
  } catch (err) {
    console.error('[tokenService] Token refresh failed:', err.message);
    // Return old tokens and let the caller decide what to do
    return tokens;
  }
}

/**
 * Fetch the list of pages (and linked IG accounts) for a user token.
 * Returns array of { page_id, page_name, page_access_token, ig_user_id, ig_username }
 */
export async function fetchPagesAndIgAccounts(userAccessToken) {
  const { data } = await axios.get(`${GRAPH_URL}/me/accounts`, {
    params: {
      fields:       'id,name,access_token,instagram_business_account{id,username}',
      access_token: userAccessToken,
    },
  });

  return (data.data || []).map((page) => ({
    page_id:           page.id,
    page_name:         page.name,
    page_access_token: page.access_token,
    ig_user_id:        page.instagram_business_account?.id || null,
    ig_username:       page.instagram_business_account?.username || null,
  }));
}
