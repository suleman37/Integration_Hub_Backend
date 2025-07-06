import { Queue, QueueEvents } from 'bullmq';
import { checkingConnectionJob, connectionQueueName } from '../config/auth';
import { ConnectionJobPayload } from '../utils/type/queue';
import { redisConnection } from '../redis/client';

export const connectionQueue = new Queue(connectionQueueName, { connection: redisConnection });

// Function to add a user job
export const addConnectionCheckingJob = async (payload: ConnectionJobPayload) => {
    await connectionQueue.add(
        checkingConnectionJob,
        payload,
        {
            repeat: {
                every: 2 * 60 * 1000, // every 30 minutes
            },
            jobId: `connection-sync-${payload.userId}`, // unique per user
        }
    );
};


const queueEvents = new QueueEvents(connectionQueueName);
queueEvents.on('completed', ({ jobId }) => {
    console.log(`done connection checking ${jobId}`);
});

queueEvents.on(
    'failed',
    ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
        console.error('error painting', failedReason);
    },
);





