import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { reservePostSlot, releasePostSlot } from '../services/planService.js';
import { uploadImage, publishToNetworks, updatePostStatus } from '../services/publishService.js';
import { refreshTokenIfNeeded } from '../services/tokenService.js';
import { schedulePost } from '../services/scheduleService.js';
import { query } from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';

export const router = Router();

const publishLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: 'Too many publish requests, please try again later.',
});

router.use(publishLimiter);

const VALID_NETWORKS = new Set(['instagram', 'facebook', 'ig_story', 'fb_story']);

// Shape/type validation only — which network *values* are valid is checked
// below so the error message can list exactly which ones weren't.
const publishSchema = z.object({
  imageBase64: z.string().min(1, 'imageBase64 is required'),
  caption: z.string().max(2200, 'caption must be 2200 characters or fewer').optional(),
  networks: z.array(z.string()).min(1, 'networks must be a non-empty array'),
  scheduledAt: z.string().optional(),
});

/**
 * POST /publish
 *
 * Body: {
 *   imageBase64: string,   // base64 or data URI
 *   caption:     string,
 *   networks:    string[], // ['instagram','facebook','ig_story','fb_story']
 *   scheduledAt: string?,  // ISO 8601 – if provided, the post is queued
 * }
 *
 * Returns: { post }
 */
router.post('/', requireAuth, validate(publishSchema), async (req, res, next) => {
  const { imageBase64, caption, networks, scheduledAt } = req.body;
  const userId = req.user.id;
  let slotReserved = false;

  try {
    const invalidNetworks = networks.filter((n) => !VALID_NETWORKS.has(n));
    if (invalidNetworks.length > 0) {
      throw createError(
        400,
        `Invalid network(s): ${invalidNetworks.join(', ')}. Valid: ${[...VALID_NETWORKS].join(', ')}`
      );
    }

    // ── Plan limit check ────────────────────────────────────────────────────
    // Reserved atomically so two concurrent requests can't both slip past
    // the limit; released below if this attempt doesn't end up published.
    await reservePostSlot(userId);
    slotReserved = true;

    // ── Upload image to Cloudinary ──────────────────────────────────────────
    const { url: imageUrl, cloudinaryId } = await uploadImage(imageBase64);

    // ── Create the post record in DB ────────────────────────────────────────
    const { rows } = await query(
      `INSERT INTO posts
         (user_id, caption, image_url, cloudinary_id, networks, status, scheduled_at)
       VALUES ($1,$2,$3,$4,$5, $6, $7)
       RETURNING *`,
      [
        userId,
        caption || '',
        imageUrl,
        cloudinaryId,
        networks,
        scheduledAt ? 'draft' : 'draft', // will be updated below
        scheduledAt ? new Date(scheduledAt) : null,
      ]
    );

    const post = rows[0];

    // ── Scheduled or immediate? ─────────────────────────────────────────────
    if (scheduledAt) {
      // Enqueue for later. The slot stays reserved — the queue worker
      // releases it if the scheduled publish ultimately fails.
      await schedulePost(post.id, scheduledAt);

      // post status is now 'queued' (set by schedulePost)
      const { rows: updated } = await query('SELECT * FROM posts WHERE id = $1', [post.id]);
      return res.status(202).json({ post: updated[0] });
    }

    // ── Publish immediately ─────────────────────────────────────────────────
    const tokens = await refreshTokenIfNeeded(userId);

    if (!tokens) {
      throw createError(
        400,
        'No Meta account connected. Please authenticate via /auth/meta first.'
      );
    }

    const { fb_post_id, ig_media_id, errors } = await publishToNetworks({
      imageUrl,
      caption: caption || '',
      networks,
      tokens,
    });

    const allFailed = errors && errors.length === networks.length;

    await updatePostStatus(post.id, {
      status: allFailed ? 'failed' : 'published',
      fb_post_id,
      ig_media_id,
      error_message: errors?.length ? JSON.stringify(errors) : null,
    });

    if (allFailed) {
      await releasePostSlot(userId);
    }

    const { rows: finalPost } = await query('SELECT * FROM posts WHERE id = $1', [post.id]);

    const statusCode = allFailed ? 502 : 201;
    return res.status(statusCode).json({
      post: finalPost[0],
      ...(errors?.length ? { warnings: errors } : {}),
    });
  } catch (err) {
    if (slotReserved) {
      await releasePostSlot(userId).catch((releaseErr) => {
        console.error('[publish] Failed to release post slot after error:', releaseErr.message);
      });
    }
    next(err);
  }
});

export default router;
