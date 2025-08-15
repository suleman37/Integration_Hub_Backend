import IORedis from 'ioredis';


export const redisConnection = new IORedis({
    host: process.env.REDIS_HOST ?? "127.0.0.1", // your Redis host
    port: parseInt(process.env.REDIS_PORT ?? "6379"),        // your Redis port
    maxRetriesPerRequest: null,
});



