# Vercel Deployment Guide

This guide will help you deploy your Integration Hub Backend to Vercel.

## Prerequisites

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Make sure you have a Vercel account at [vercel.com](https://vercel.com)

## Deployment Steps

### 1. Login to Vercel
```bash
vercel login
```

### 2. Deploy to Vercel
```bash
vercel --prod
```

Or use the npm script:
```bash
npm run deploy
```

### 3. Environment Variables

Make sure to set the following environment variables in your Vercel project:

- `NODE_ENV`: Set to `production`
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret key
- `REDIS_URL`: Your Redis connection URL
- Any other environment variables your app requires

### 4. Build Configuration

The project is configured to:
- Use TypeScript compilation (`tsc`)
- Build from the `api/index.ts` entry point
- Set maximum function duration to 30 seconds
- Route all requests to the API function

## Project Structure for Vercel

- `api/index.ts` - Main entry point for Vercel
- `src/` - Source code directory
- `vercel.json` - Vercel configuration
- `tsconfig.json` - TypeScript configuration

## Important Notes

1. **Database Connections**: Ensure your database (MongoDB, PostgreSQL) is accessible from Vercel's servers
2. **Redis**: Make sure your Redis instance is accessible from Vercel
3. **File Storage**: For file uploads, consider using cloud storage services like AWS S3 or Cloudinary
4. **Environment Variables**: Set all required environment variables in Vercel dashboard

## Troubleshooting

- Check Vercel function logs in the dashboard
- Ensure all dependencies are properly installed
- Verify environment variables are set correctly
- Check database connectivity from Vercel's servers

## Local Development

For local development, continue using:
```bash
npm run dev
```

This will run the server locally with hot reloading. 