import { getPublishQueue } from '../jobs/publishQueue.js';
import { query } from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

/**
 * Schedule a post for future publishing.
 * Adds a delayed job to the Bull queue and stores the Bull job ID on the post record.
 *
 * @param {string} postId       UUID of the post
 * @param {Date|string} scheduledAt  When to publish
 * @returns {object} Bull Job
 */
export async function schedulePost(postId, scheduledAt) {
  const publishAt = new Date(scheduledAt);

  if (isNaN(publishAt.getTime())) {
    throw createError(400, 'Invalid scheduledAt date');
  }

  const now = new Date();
  if (publishAt <= now) {
    throw createError(400, 'scheduledAt must be in the future');
  }

  const delay = publishAt.getTime() - now.getTime();

  const queue = getPublishQueue();

  const job = await queue.add(
    { postId },
    {
      delay,
      attempts:  3,
      backoff: {
        type:  'exponential',
        delay: 10_000, // 10s initial back-off
      },
      removeOnComplete: 100, // keep last 100 completed jobs
      removeOnFail:     50,
    }
  );

  // Persist Bull job ID so we can cancel if needed
  await query(
    "UPDATE posts SET bull_job_id = $1, status = 'queued' WHERE id = $2",
    [String(job.id), postId]
  );

  console.log(`[scheduleService] Post ${postId} scheduled for ${publishAt.toISOString()} (job #${job.id})`);

  return job;
}

/**
 * Cancel a previously scheduled post job.
 * Removes the job from Bull and sets the post status back to 'draft'.
 *
 * @param {string} postId  UUID of the post
 */
export async function cancelScheduledPost(postId) {
  const { rows } = await query(
    'SELECT bull_job_id, status FROM posts WHERE id = $1',
    [postId]
  );

  if (!rows[0]) {
    throw createError(404, 'Post not found');
  }

  const { bull_job_id, status } = rows[0];

  if (status === 'published') {
    throw createError(409, 'Cannot cancel a post that has already been published');
  }

  if (bull_job_id) {
    try {
      const queue = getPublishQueue();
      const job = await queue.getJob(bull_job_id);
      if (job) {
        await job.remove();
        console.log(`[scheduleService] Cancelled Bull job #${bull_job_id} for post ${postId}`);
      }
    } catch (err) {
      // Log but don't throw – the job may have already run or been removed
      console.warn(`[scheduleService] Could not remove Bull job #${bull_job_id}:`, err.message);
    }
  }

  await query(
    "UPDATE posts SET status = 'draft', bull_job_id = NULL, scheduled_at = NULL WHERE id = $1",
    [postId]
  );
}

/**
 * Reschedule a queued post to a new time.
 */
export async function reschedulePost(postId, newScheduledAt) {
  await cancelScheduledPost(postId);

  // Reset the scheduled_at before re-scheduling
  await query(
    'UPDATE posts SET scheduled_at = $1 WHERE id = $2',
    [new Date(newScheduledAt), postId]
  );

  return schedulePost(postId, newScheduledAt);
}
