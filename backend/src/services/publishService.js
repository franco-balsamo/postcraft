import axios from 'axios';
import cloudinary, { cloudinaryEnabled } from '../config/cloudinary.js';
import { query } from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

const GRAPH_URL = 'https://graph.facebook.com/v18.0';

// ─── Cloudinary ───────────────────────────────────────────────────────────────

/**
 * Upload a base64-encoded image to Cloudinary.
 * Returns { url, cloudinaryId }
 */
export async function uploadImage(base64Data, folder = 'postcraft') {
  if (!cloudinaryEnabled) {
    throw createError(503, 'Image upload is not configured. Set CLOUDINARY_* environment variables.');
  }

  // Accept both raw base64 and data URI format
  const dataUri = base64Data.startsWith('data:')
    ? base64Data
    : `data:image/png;base64,${base64Data}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
    format:        'jpg',
    quality:       'auto:good',
    fetch_format:  'auto',
  });

  return {
    url:         result.secure_url,
    cloudinaryId: result.public_id,
  };
}

/**
 * Delete an image from Cloudinary by public_id.
 */
export async function deleteImage(cloudinaryId) {
  if (!cloudinaryId) return;
  await cloudinary.uploader.destroy(cloudinaryId);
}

// ─── Instagram ───────────────────────────────────────────────────────────────

/**
 * Publish a feed post to Instagram.
 *  1. Create a media container
 *  2. Publish the container
 * Returns the IG media ID.
 */
export async function publishToInstagram(imageUrl, caption, igUserId, accessToken) {
  if (!igUserId || !accessToken) {
    throw createError(400, 'Missing igUserId or accessToken for Instagram publish');
  }

  // Step 1 – create container
  const containerRes = await axios.post(
    `${GRAPH_URL}/${igUserId}/media`,
    null,
    {
      params: {
        image_url:    imageUrl,
        caption,
        access_token: accessToken,
      },
    }
  );

  const creationId = containerRes.data?.id;
  if (!creationId) {
    throw createError(502, 'Instagram did not return a media container ID');
  }

  // Step 2 – wait briefly then publish
  await waitForContainerReady(igUserId, creationId, accessToken);

  const publishRes = await axios.post(
    `${GRAPH_URL}/${igUserId}/media_publish`,
    null,
    {
      params: {
        creation_id:  creationId,
        access_token: accessToken,
      },
    }
  );

  const mediaId = publishRes.data?.id;
  if (!mediaId) {
    throw createError(502, 'Instagram did not return a media ID after publish');
  }

  return mediaId;
}

/**
 * Publish an Instagram Story (image).
 * Returns the IG media ID.
 */
export async function publishStoryInstagram(imageUrl, igUserId, accessToken) {
  if (!igUserId || !accessToken) {
    throw createError(400, 'Missing igUserId or accessToken for Instagram Story publish');
  }

  const containerRes = await axios.post(
    `${GRAPH_URL}/${igUserId}/media`,
    null,
    {
      params: {
        image_url:    imageUrl,
        media_type:   'STORIES',
        access_token: accessToken,
      },
    }
  );

  const creationId = containerRes.data?.id;
  if (!creationId) {
    throw createError(502, 'Instagram did not return a Story container ID');
  }

  await waitForContainerReady(igUserId, creationId, accessToken);

  const publishRes = await axios.post(
    `${GRAPH_URL}/${igUserId}/media_publish`,
    null,
    {
      params: {
        creation_id:  creationId,
        access_token: accessToken,
      },
    }
  );

  return publishRes.data?.id;
}

/**
 * Poll the IG container status until it is FINISHED (ready to publish).
 * Times out after ~30 seconds.
 */
async function waitForContainerReady(igUserId, creationId, accessToken, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await axios.get(`${GRAPH_URL}/${creationId}`, {
      params: { fields: 'status_code', access_token: accessToken },
    });

    const status = data?.status_code;

    if (status === 'FINISHED') return;
    if (status === 'ERROR' || status === 'EXPIRED') {
      throw createError(502, `Instagram media container failed with status: ${status}`);
    }

    // Wait 3 seconds before next poll
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  throw createError(504, 'Timed out waiting for Instagram media container to be ready');
}

// ─── Facebook ────────────────────────────────────────────────────────────────

/**
 * Publish a photo post to a Facebook Page.
 * Returns the FB post ID.
 */
export async function publishToFacebook(imageUrl, caption, pageId, pageAccessToken) {
  if (!pageId || !pageAccessToken) {
    throw createError(400, 'Missing pageId or pageAccessToken for Facebook publish');
  }

  const { data } = await axios.post(
    `${GRAPH_URL}/${pageId}/photos`,
    null,
    {
      params: {
        url:          imageUrl,
        caption,
        access_token: pageAccessToken,
        published:    true,
      },
    }
  );

  const postId = data?.post_id || data?.id;
  if (!postId) {
    throw createError(502, 'Facebook did not return a post ID');
  }

  return postId;
}

/**
 * Publish a photo Story to a Facebook Page.
 * Returns the story media ID.
 */
export async function publishStoryFacebook(imageUrl, pageId, pageAccessToken) {
  if (!pageId || !pageAccessToken) {
    throw createError(400, 'Missing pageId or pageAccessToken for Facebook Story publish');
  }

  // Upload to FB photo stories endpoint
  const { data } = await axios.post(
    `${GRAPH_URL}/${pageId}/photo_stories`,
    null,
    {
      params: {
        url:          imageUrl,
        access_token: pageAccessToken,
      },
    }
  );

  return data?.post_id || data?.id;
}

// ─── Orchestration ───────────────────────────────────────────────────────────

/**
 * Publish a post to one or more networks.
 * @param {object} opts
 * @param {string}   opts.imageUrl       Publicly accessible image URL (Cloudinary)
 * @param {string}   opts.caption
 * @param {string[]} opts.networks        e.g. ['instagram','facebook','ig_story']
 * @param {object}   opts.tokens          { user_access_token, page_id, page_access_token,
 *                                          ig_user_id }
 * @returns {{ fb_post_id, ig_media_id }}
 */
export async function publishToNetworks({ imageUrl, caption, networks, tokens }) {
  const results = { fb_post_id: null, ig_media_id: null };
  const errors  = [];

  for (const network of networks) {
    try {
      switch (network) {
        case 'instagram':
          results.ig_media_id = await publishToInstagram(
            imageUrl, caption, tokens.ig_user_id, tokens.user_access_token
          );
          break;

        case 'ig_story':
          await publishStoryInstagram(
            imageUrl, tokens.ig_user_id, tokens.user_access_token
          );
          break;

        case 'facebook':
          results.fb_post_id = await publishToFacebook(
            imageUrl, caption, tokens.page_id, tokens.page_access_token
          );
          break;

        case 'fb_story':
          await publishStoryFacebook(
            imageUrl, tokens.page_id, tokens.page_access_token
          );
          break;

        default:
          console.warn(`[publishService] Unknown network: ${network}`);
      }
    } catch (err) {
      console.error(`[publishService] Failed to publish to ${network}:`, err.message);
      errors.push({ network, error: err.message });
    }
  }

  if (errors.length > 0 && errors.length === networks.length) {
    // All networks failed
    throw createError(502, 'All publish attempts failed', errors);
  }

  return { ...results, errors };
}

/**
 * Mark a post record as published (or failed) in the database.
 */
export async function updatePostStatus(postId, { status, fb_post_id, ig_media_id, error_message }) {
  await query(
    `UPDATE posts SET
       status        = $1,
       fb_post_id    = COALESCE($2, fb_post_id),
       ig_media_id   = COALESCE($3, ig_media_id),
       error_message = $4,
       published_at  = CASE WHEN $1 = 'published' THEN NOW() ELSE published_at END
     WHERE id = $5`,
    [status, fb_post_id || null, ig_media_id || null, error_message || null, postId]
  );
}
