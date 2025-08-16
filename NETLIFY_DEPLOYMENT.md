# Netlify Deployment Guide

This guide will help you deploy your Node.js backend application to Netlify.

## Prerequisites

1. A Netlify account
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Connect Your Repository

1. Go to [Netlify](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose your Git provider and select your repository
4. Configure the build settings:
   - **Build command**: `npm run netlify-build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

### 2. Environment Variables

Set the following environment variables in Netlify:
- `NODE_ENV`: `production`
- `PORT`: `8888` (Netlify's default)
- Any database connection strings or API keys your app needs

### 3. Deploy

1. Click "Deploy site"
2. Netlify will automatically build and deploy your application
3. Your API will be available at: `https://your-site-name.netlify.app/.netlify/functions/api/*`

## Important Notes

- **Serverless Functions**: Your Express app is now running as a Netlify serverless function
- **Cold Starts**: There may be a slight delay on the first request after inactivity
- **Function Timeout**: Netlify functions have a 10-second timeout by default
- **Database Connections**: Ensure your database allows connections from Netlify's IP ranges

## Local Testing

To test your Netlify function locally:

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Run: `netlify dev`
3. Your function will be available at: `http://localhost:8888/.netlify/functions/api/*`

## Troubleshooting

- Check the build logs in Netlify for any build errors
- Ensure all dependencies are properly listed in package.json
- Verify that your environment variables are set correctly
- Check that your database is accessible from Netlify's servers

## API Endpoints

Your API endpoints will be available at:
- `/api/auth/*` - Authentication routes
- `/api/users/*` - User management
- `/api/connections/*` - Connection management
- `/api/integrations/*` - Integration management
- And more...

## Support

If you encounter issues, check:
1. Netlify build logs
2. Function logs in the Netlify dashboard
3. Your application logs for any errors 