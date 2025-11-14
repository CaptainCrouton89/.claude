---
name: Railway CLI Management
description: Deploy, manage services, view logs, and configure Railway infrastructure. Use when deploying to Railway, managing environment variables, viewing deployment logs, scaling services, or managing volumes.
---

# Railway CLI Management

Master Railway CLI for deployments, service management, log viewing, and infrastructure operations.

## Quick Reference

### Deployment

```bash
# Deploy current directory to linked service
railway up

# Deploy without attaching to logs
railway up --detach

# Deploy to specific service
railway up --service api

# Deploy to specific environment
railway up --environment production

# Redeploy latest deployment
railway redeploy

# Redeploy specific service
railway redeploy --service worker

# Skip confirmation
railway redeploy --yes

# Remove most recent deployment
railway down

# Remove deployment from specific service
railway down --service api
```

### Service & Project Management

```bash
# List all projects
railway list

# Link to existing project (interactive)
railway link

# Link to specific project by ID
railway link <project-id>

# Show current project status
railway status

# Get status as JSON (includes deployment IDs!)
railway status --json

# Open project dashboard in browser
railway open

# Unlink current directory from project
railway unlink

# Link to specific service
railway service <service-name-or-id>

# Add new service to project
railway add
```

### Getting Deployment IDs

**Best Method:**
```bash
# Get full project status including deployment IDs
railway status --json

# Extract specific deployment ID using jq
railway status --json | jq -r '.services.edges[0].node.serviceInstances.edges[0].node.latestDeployment.id'

# Get deployment ID for specific service
railway status --json | jq -r '.services.edges[] | select(.node.name=="api") | .node.serviceInstances.edges[0].node.latestDeployment.id'
```

**Output Structure:**
- `.services.edges[].node` - Service info
- `.node.serviceInstances.edges[].node.latestDeployment.id` - Latest deployment UUID
- `.node.serviceInstances.edges[].node.latestDeployment.meta` - Commit info, build config, etc.

### Logs

**View Logs**
```bash
# Stream logs for latest deployment
railway logs

# View logs for specific service
railway logs --service api

# View logs for specific environment
railway logs --environment production

# View deployment logs (startup/runtime)
railway logs --deployment

# View build logs
railway logs --build

# View logs for specific deployment by ID
railway logs <deployment-id>

# Get logs for specific service deployment
railway logs --service worker --deployment

# Output as JSON
railway logs --json

# Combine options
railway logs --service api --deployment --json
```

**Logs Tips:**
- Default: Shows latest deployment logs
- Deployment logs: Application startup and runtime output
- Build logs: Compilation, dependencies, Nixpacks output
- Use `--json` with `jq` for filtering

### Environment Variables

```bash
# List all variables for active environment
railway variables

# List for specific service
railway variables --service api

# List for specific environment
railway variables --environment production

# Show as key=value format
railway variables --kv

# Output as JSON
railway variables --json

# Set variable(s)
railway variables --set "DATABASE_URL=postgres://..."

# Set multiple
railway variables --set "NODE_ENV=production" --set "LOG_LEVEL=debug"

# Run local command with Railway variables
railway run npm start

# Open subshell with Railway variables loaded
railway shell
```

### Environments

```bash
# Link to environment (interactive)
railway environment

# Link to specific environment
railway environment production

# Create new environment
railway environment new

# Delete environment
railway environment delete <environment-name>
```

### Scaling

```bash
# Scale service in linked environment
railway scale --us-west1 3

# Scale specific service
railway scale --service api --us-west1 2

# Scale across multiple regions
railway scale --us-west1 2 --europe-west4 1

# Available regions:
# --us-west1, --us-west2, --us-east4
# --europe-west4, --asia-southeast1
```

### Volumes

```bash
# List volumes
railway volume list

# List for specific service
railway volume list --service api

# Add new volume
railway volume add

# Delete volume
railway volume delete <volume-id>

# Update volume
railway volume update <volume-id>

# Detach volume from service
railway volume detach <volume-id>

# Attach volume to service
railway volume attach <volume-id>
```

### Database Connection

```bash
# Connect to database shell
railway connect

# Examples:
# - PostgreSQL: Opens psql
# - MongoDB: Opens mongosh
# - MySQL: Opens mysql
# - Redis: Opens redis-cli
```

### Authentication

```bash
# Login to Railway account
railway login

# Logout
railway logout

# Check current user
railway whoami
```

## Common Workflows

### Initial Project Setup

```bash
# Login
railway login

# Link to existing project
railway link

# Or create new project
railway init

# Link to service
railway service api

# Link to environment
railway environment production

# Check status
railway status
```

### Deploy with Environment Variables

```bash
# Set variables
railway variables --set "NODE_ENV=production" --set "API_KEY=secret"

# Deploy
railway up

# Monitor logs
railway logs --deployment
```

### Debug Failed Deployment

```bash
# Get deployment ID
DEPLOY_ID=$(railway status --json | jq -r '.services.edges[0].node.serviceInstances.edges[0].node.latestDeployment.id')

# View build logs
railway logs $DEPLOY_ID --build

# View deployment logs
railway logs $DEPLOY_ID --deployment

# Check full status
railway status --json | jq '.services.edges[].node.serviceInstances.edges[].node.latestDeployment'
```

### Monitor Multiple Services

```bash
# Terminal 1: API logs
railway logs --service api --deployment

# Terminal 2: Worker logs
railway logs --service worker --deployment

# Or use JSON + jq for filtering
railway logs --service api --json | jq 'select(.level == "error")'
```

### Extract Deployment Information

```bash
# Get all deployment IDs
railway status --json | jq -r '.services.edges[].node | {service: .name, deployment: .serviceInstances.edges[0].node.latestDeployment.id}'

# Get commit info for deployment
railway status --json | jq -r '.services.edges[].node.serviceInstances.edges[].node.latestDeployment.meta | {commit: .commitHash, message: .commitMessage}'

# Get service URLs
railway status --json | jq -r '.services.edges[].node | select(.serviceInstances.edges[0].node.latestDeployment.canRedeploy == true)'
```

### Redeploy After Config Change

```bash
# Change variables
railway variables --set "NEW_VAR=value"

# Redeploy to pick up changes
railway redeploy --yes

# Or deploy fresh
railway up
```

### Run Commands with Railway Environment

```bash
# Run migration
railway run npm run migrate

# Run seed script
railway run node scripts/seed.js

# Start local dev with production variables
railway run npm run dev

# Open shell with all variables
railway shell
```

## Important Notes

**Deployment Targets**
- Production: Linked to production environment
- Preview: Branch-based deployments (configured in Railway dashboard)
- Development: Local with `railway run` or `railway shell`

**JSON Output**
- `railway status --json` is the most comprehensive command
- Contains: services, deployment IDs, commit info, build config, service instances
- Use `jq` for parsing and filtering

**Environment Linking**
- Project, service, and environment are all linked separately
- Use `railway status` to verify what you're linked to
- Change with `railway service`, `railway environment`, `railway link`

**Logs Behavior**
- Default: Latest deployment logs (5-minute window)
- Deployment logs: Application output (stdout/stderr)
- Build logs: Nixpacks, dependencies, compilation
- JSON output: Structured logs for parsing

**Railway.json Configuration**
- Stored in project root
- Defines build/deploy configuration per service
- Example:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm run build"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Common Issues**
- No TTY errors: Command requires interactive input (use JSON output or flags)
- Service not linked: Run `railway service <service-name>` first
- Environment not linked: Run `railway environment <env-name>` first
- Deployment not found: Use `railway status --json` to verify deployment ID exists

## Examples from Real Projects

**Saturn Backend (API + Worker)**
```bash
# Check both services status
railway status --json | jq '.services.edges[] | {
  service: .node.name,
  deployment: .node.serviceInstances.edges[0].node.latestDeployment.id,
  commit: .node.serviceInstances.edges[0].node.latestDeployment.meta.commitHash
}'

# Get API deployment logs
railway logs --service api --deployment

# Get worker deployment logs
railway logs --service worker --deployment

# Redeploy both after config change
railway redeploy --service api --yes
railway redeploy --service worker --yes
```

**Debug Production Issue**
```bash
# Stream live logs with error filtering
railway logs --service api --deployment --json | jq 'select(.level == "error" or .level == "fatal")'

# Get recent deployment metadata
railway status --json | jq '.services.edges[] | select(.node.name == "api") | .node.serviceInstances.edges[0].node.latestDeployment.meta'

# Check health check configuration
railway status --json | jq '.services.edges[].node.serviceInstances.edges[].node.latestDeployment.meta.fileServiceManifest.deploy'
```
