import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { query } from '../config/db.js';
import { deleteImage } from '../services/publishService.js';
import { cancelScheduledPost } from '../services/scheduleService.js';
import { createError } from '../middleware/errorHandler.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';

export const router = Router();

const postsLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later.',
});

router.use(postsLimiter);

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(['draft', 'queued', 'published', 'failed']).optional(),
});

const postIdParamSchema = z.object({
  id: z.string().uuid('invalid post id'),
});

/**
 * GET /posts
 * Query params: page (default 1), limit (default 20), status
 */
router.get('/', requireAuth, validate(listQuerySchema, 'query'), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit, status } = req.query;
    const offset = (page - 1) * limit;

    let text = 'SELECT * FROM posts WHERE user_id = $1';
    let values = [userId];

    if (status) {
      values.push(status);
      text += ` AND status = $${values.length}`;
    }

    text += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const { rows: posts } = await query(text, values);

    // Total count for pagination
    let countText = 'SELECT COUNT(*) FROM posts WHERE user_id = $1';
    let countValues = [userId];
    if (status) {
      countValues.push(status);
      countText += ` AND status = $${countValues.length}`;
    }
    const { rows: countRows } = await query(countText, countValues);
    const total = parseInt(countRows[0].count, 10);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /posts/:id
 */
router.get('/:id', requireAuth, validate(postIdParamSchema, 'params'), async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM posts WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.user.id,
    ]);

    if (!rows[0]) {
      throw createError(404, 'Post not found');
    }

    res.json({ post: rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /posts/:id
 * Only drafts and queued posts can be deleted.
 * Queued posts are also removed from the Bull queue.
 */
router.delete(
  '/:id',
  requireAuth,
  validate(postIdParamSchema, 'params'),
  async (req, res, next) => {
    try {
      const { rows } = await query('SELECT * FROM posts WHERE id = $1 AND user_id = $2', [
        req.params.id,
        req.user.id,
      ]);

      const post = rows[0];

      if (!post) {
        throw createError(404, 'Post not found');
      }

      if (post.status === 'published') {
        throw createError(
          409,
          'Published posts cannot be deleted. Remove the post directly from the social platform.'
        );
      }

      // Cancel Bull job if queued
      if (post.status === 'queued' && post.bull_job_id) {
        try {
          await cancelScheduledPost(post.id);
        } catch (err) {
          console.warn('[posts] cancelScheduledPost error (continuing delete):', err.message);
        }
      }

      // Delete image from Cloudinary
      if (post.cloudinary_id) {
        await deleteImage(post.cloudinary_id).catch((e) =>
          console.warn('[posts] Cloudinary delete error (continuing):', e.message)
        );
      }

      await query('DELETE FROM posts WHERE id = $1', [post.id]);

      res.json({ message: 'Post deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
