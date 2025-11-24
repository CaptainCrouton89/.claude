---
name: Vercel CLI Management
description: Deploy, manage environment variables, view logs, and configure cron jobs with Vercel CLI. Use when deploying to Vercel, managing env vars (add/update/remove), viewing runtime/build logs, or configuring scheduled tasks in vercel.json.
---

# Vercel CLI Management

Master Vercel CLI for deployments, environment variable management, log viewing, and cron job configuration.

## Quick Reference

### Deployment
```bash
# Deploy current directory (preview)
vercel

# Deploy to production
vercel deploy --prod
# or
vercel --prod

# Force redeploy (even if unchanged)
vercel deploy --force

# Deploy with inline env vars
vercel deploy --env NODE_ENV=production -e API_KEY=secret

# Build locally first, then deploy
vercel build
vercel deploy --prebuilt

# Rebuild + redeploy previous deployment
vercel redeploy <deployment-url-or-id>

# Promote preview deployment to production
vercel promote <deployment-url-or-id>

# Rollback to previous deployment
vercel rollback <deployment-url-or-id>

# List all deployments
vercel list

# Get deployment info
vercel inspect <deployment-url-or-id>

# Delete deployment(s)
vercel remove <deployment-id>
```

### Environment Variables

**List**
```bash
# List all env vars (development by default)
vercel env list

# List for specific environment
vercel env list production
vercel env list preview
vercel env list development

# List for specific git branch
vercel env list production main
```

**Add**
```bash
# Add to all environments (interactive)
vercel env add MY_VAR
# Enter value when prompted

# Add to specific environment
vercel env add API_TOKEN production

# Add sensitive variable (masked in dashboard)
vercel env add SECRET_KEY --sensitive

# Override existing
vercel env add MY_VAR --force

# Add for specific git branch
vercel env add DB_URL production main
```

**Update**
```bash
# Update in all environments (interactive)
vercel env update MY_VAR

# Update specific environment
vercel env update API_TOKEN production

# Update from stdin
cat ~/.npmrc | vercel env update NPM_RC production
vercel env update CONFIG production < config.json

# Mark as sensitive
vercel env update SECRET_KEY --sensitive
```

**Remove**
```bash
# Remove from all environments
vercel env remove API_TOKEN

# Remove from specific environment
vercel env remove SECRET_KEY production

# Skip confirmation
vercel env remove API_TOKEN -y

# Remove for specific branch
vercel env remove DB_URL production main
```

**Pull to Local**
```bash
# Pull development vars to .env.local
vercel env pull

# Pull to custom file
vercel env pull .env.development.local

# Pull specific environment
vercel env pull .env.production --environment production
```

### Logs

**Runtime Logs** (live application logs)
```bash
# Stream runtime logs for 5 minutes
vercel logs <deployment-url-or-id>

# Example with Jupiter deployment
vercel logs jupiter-qhb0ke91n-captaincrouton89s-projects.vercel.app

# Output as JSON (for piping to jq)
vercel logs <deployment-url-or-id> --json

# Filter with jq
vercel logs <deployment-url-or-id> --json | jq 'select(.level == "error")'
```

**Build Logs** (compilation + deployment)
```bash
# Show build logs for a deployment
vercel inspect <deployment-url-or-id> --logs

# Wait for build to complete and show logs
vercel inspect <deployment-url-or-id> --logs --wait

# Timeout after X seconds
vercel inspect <deployment-url-or-id> --logs --timeout 90s
```

### Cron Jobs

Cron jobs are **configured in `vercel.json`** only—there are no CLI commands for management.

**Configuration (`vercel.json`)**
```json
{
  "crons": [
    {
      "path": "/api/cron/email-sync",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/weekly-digest",
      "schedule": "0 0 * * 1"
    },
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Cron Expression Format** (standard cron syntax, UTC timezone)
```
minute (0-59) hour (0-23) day-of-month (1-31) month (1-12) day-of-week (0-6)
```

**Examples**
```
*/5 * * * *      Every 5 minutes
0 */4 * * *      Every 4 hours
0 0 * * *        Daily at midnight UTC
0 9 * * 1        Every Monday at 9 AM UTC
0 0 1 * *        First day of month
0 0 * * 0        Every Sunday
```

**Important Constraints**
- Cannot use both day-of-month AND day-of-week; one must be `*`
- No text alternatives (MON, SUN, JAN, DEC not supported)
- All times in UTC
- Cron jobs make GET requests to your deployment with `vercel-cron/1.0` user agent

**Verify Crons**
- Modify `vercel.json` and redeploy: `vercel deploy --prod`
- View status in dashboard: Project → Settings → Cron Jobs
- Monitor logs: `vercel logs <deployment-url>`

## Common Workflows

### Deploy with Environment Variables

**Interactive**
```bash
# Deploy and set vars interactively
vercel env add NODE_ENV
vercel env add LOG_LEVEL
vercel deploy --prod
```

**Command Line**
```bash
# Single deploy with env vars
vercel deploy --prod -e NODE_ENV=production -e LOG_LEVEL=debug
```

### Fix Failed Deployment

```bash
# Check what went wrong
vercel inspect <deployment-id> --logs

# Fix code or config, then redeploy
# Option 1: Build and deploy changed code
vercel deploy --prod

# Option 2: Rebuild previous deployment with fixes
vercel redeploy <deployment-id> --target production

# Option 3: Rollback to last known good
vercel rollback <deployment-id>
```

### Monitor Live Application

```bash
# View recent runtime logs (5-minute window, live stream)
vercel logs my-app-xyz.vercel.app

# Filter for errors only
vercel logs my-app-xyz.vercel.app --json | jq 'select(.level == "error")'

# Follow specific cron job execution
vercel logs my-app-xyz.vercel.app --json | jq 'select(.path == "/api/cron/email-sync")'
```

### Environment Variable Workflow

```bash
# Add secrets for production
vercel env add DATABASE_URL production
vercel env add API_KEY production --sensitive

# Pull development vars locally
vercel env pull .env.local

# Update after rotation
vercel env update API_KEY production

# Remove deprecated vars
vercel env remove OLD_TOKEN -y
```

### Debug Cron Jobs

```bash
# 1. Verify config in vercel.json
cat vercel.json

# 2. Deploy with changes
vercel deploy --prod

# 3. Monitor execution in logs
vercel logs <deployment-url> --json | jq 'select(.path == "/api/cron/your-route")'

# 4. Check cron logs in dashboard
# Project → Settings → Cron Jobs → View Logs button
```

## Important Notes

**Deployment Targets**
- Production: Assigned to project domains, no live preview
- Preview: Auto-generated URL, live preview before promoting
- Development: Local testing with `vercel dev`

**Environment Scopes**
- `production` - Production environment
- `preview` - Preview/staging deployments
- `development` - Local `.env.local` file
- Git branches - Specific branch overrides

**API Rate Limits**
- Check dashboard for per-team limits
- Redeploys and promotions may have separate limits

**User Agent Detection for Crons**
- Vercel cron requests include: `User-Agent: vercel-cron/1.0`
- Use for authentication: `if (req.headers['user-agent'] === 'vercel-cron/1.0')`

## Examples from Real Projects

**Jupiter Mail Project**
```json
{
  "crons": [
    {
      "path": "/api/cron/email-sync",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/weekly-digest",
      "schedule": "0 0 * * 1"
    },
    {
      "path": "/api/cron/delete-old-emails",
      "schedule": "0 0 * * *"
    }
  ]
}
```

Deploy with: `vercel deploy --prod`
