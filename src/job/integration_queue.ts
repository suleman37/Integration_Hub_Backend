import { Queue, QueueEvents } from 'bullmq';
import { fileIntegrationJob, integrationQueueName } from '../config/auth';
import { FileIntegrationJobPayload } from '../utils/type/queue';
import { redisConnection } from '../redis/client';

export const integrationQueue = new Queue(integrationQueueName,
    {
        connection: redisConnection,
    },
);

// Function to add a user job
export const addFileIntegrationJob = async (payload: FileIntegrationJobPayload) => {
    await integrationQueue.add(
        fileIntegrationJob,
        payload,
        {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        }
    );
};

const queueEvents = new QueueEvents(integrationQueueName);
queueEvents.on('completed', ({ jobId }) => {
    console.log(`done connection checking ${jobId}`);
});

queueEvents.on('failed', ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
    console.error(`error painting ${jobId}`, failedReason);
},
);



