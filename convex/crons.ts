import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// Run daily at midnight to clean up trash
crons.daily('clean-trash', { hourUTC: 0, minuteUTC: 0 }, internal.drafts.hardDeleteOldDrafts);

export default crons;
