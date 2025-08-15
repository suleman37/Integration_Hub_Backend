import { Worker } from 'bullmq';
import { checkingConnection, fileIntegrationAddObject, scheduleIntegrationAddObject } from './handler';
import { redisConnection } from '../redis/client';
import {
    checkingConnectionJob,
    connectionQueueName,
    fileIntegrationJob,
    integrationQueueName,
    scheduleIntegrationJob
} from '../config/auth';


export const connectionWorker = new Worker(connectionQueueName, async job => {
    if (job.name === checkingConnectionJob) {
        await checkingConnection(job.data)
    }
}, {
    connection: redisConnection,
    concurrency: 5
});


export const integrationWorker = new Worker(integrationQueueName, async (job) => {
    if (job.name === fileIntegrationJob) {
        await fileIntegrationAddObject(job.data)
    }

    if (job.name === scheduleIntegrationJob) {
        await scheduleIntegrationAddObject(job.data)
    }
}, {
    connection: redisConnection,
    concurrency: 5
});


// Optional but highly recommended
integrationWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
});

integrationWorker.on('failed', (job: any, err: any) => {
    console.error(`❌ Job ${job.id} failed`, err);
});

integrationWorker.on('error', (err) => {
    console.error('🚨 Worker error:', err);
});



