import Bull from 'bull';
import 'dotenv/config';
import { getTokensByUserId, refreshTokenIfNeeded } from '../services/tokenService.js';
import { publishToNetworks, updatePostStatus } from '../services/publishService.js';
import { incrementPostCount } from '../services/planService.js';
import { query } from '../config/db.js';

const QUEUE_NAME = 'postcraft:publish';

let publishQueue = null;

/**
 * Lazily initialise (or return) the singleton Bull queue.
 * Using a getter pattern avoids circular import issues at module load time.
 */
export function getPublishQueue() {
  if (publishQueue) return publishQueue;

  publishQueue = new Bull(QUEUE_NAME, {
    redis: process.env.REDIS_URL,
    defaultJobOptions: {
      attempts:  3,
      backoff: {
        type:  'exponential',
        delay: 10_000,
      },
      removeOnComplete: 100,
      removeOnFail:     50,
    },
  });

  // ── Processor ──────────────────────────────────────────────────────────────
  publishQueue.process(async (job) => {
    const { postId } = job.data;
    console.log(`[publishQueue] Processing job #${job.id} for post ${postId}`);

    // 1. Load the post
    const { rows: postRows } = await query(
      'SELECT * FROM posts WHERE id = $1',
      [postId]
    );
    const post = postRows[0];

    if (!post) {
      throw new Error(`Post ${postId} not found`);
    }

    if (post.status === 'published') {
      console.log(`[publishQueue] Post ${postId} already published – skipping`);
      return { skipped: true };
    }

    // 2. Load & refresh tokens
    const tokens = await refreshTokenIfNeeded(post.user_id);

    if (!tokens) {
      throw new Error(`No Meta tokens for user ${post.user_id}`);
    }

    // 3. Publish
    const { fb_post_id, ig_media_id, errors } = await publishToNetworks({
      imageUrl: post.image_url,
      caption:  post.caption,
      networks: post.networks,
      tokens,
    });

    const allFailed = errors && errors.length === post.networks.length;

    if (allFailed) {
      throw new Error(`All publish attempts failed: ${errors.map((e) => e.error).join('; ')}`);
    }

    // 4. Update post status
    await updatePostStatus(postId, {
      status:      'published',
      fb_post_id,
      ig_media_id,
      error_message: errors?.length ? JSON.stringify(errors) : null,
    });

    // 5. Increment monthly counter
    await incrementPostCount(post.user_id);

    console.log(`[publishQueue] Post ${postId} published successfully`);
    return { fb_post_id, ig_media_id };
  });

  // ── Events ─────────────────────────────────────────────────────────────────
  publishQueue.on('completed', (job, result) => {
    console.log(`[publishQueue] Job #${job.id} completed`, result);
  });

  publishQueue.on('failed', async (job, err) => {
    console.error(`[publishQueue] Job #${job.id} failed (attempt ${job.attemptsMade}):`, err.message);

    // On final failure, mark the post as failed
    if (job.attemptsMade >= job.opts.attempts) {
      const { postId } = job.data;
      try {
        await updatePostStatus(postId, {
          status:        'failed',
          error_message: err.message,
        });
      } catch (dbErr) {
        console.error('[publishQueue] Could not update post status to failed:', dbErr.message);
      }
    }
  });

  publishQueue.on('stalled', (job) => {
    console.warn(`[publishQueue] Job #${job.id} stalled`);
  });

  publishQueue.on('error', (err) => {
    console.error('[publishQueue] Queue error:', err.message);
  });

  console.log(`[publishQueue] Queue "${QUEUE_NAME}" initialised`);
  return publishQueue;
}

/**
 * Gracefully close the queue connection (call on process exit).
 */
export async function closePublishQueue() {
  if (publishQueue) {
    await publishQueue.close();
    publishQueue = null;
    console.log('[publishQueue] Queue closed');
  }
}
