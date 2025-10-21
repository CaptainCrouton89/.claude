# Cloudflare R2 Image Hosting for Mystica

**Last Updated:** 2024-10-20
**Status:** Active
**Purpose:** Document the Cloudflare R2 integration for hosting AI reference images in the Mystica image generation pipeline

## Overview

Mystica uses Cloudflare R2 object storage to host reference images for the AI image generation pipeline. This setup replaces local file references with cloud-hosted URLs, enabling the `generate-image.ts` script to use reference images in both local development and production environments.

**Key Benefits:**
- **Universal Access:** Reference images available from any environment
- **Performance:** Global CDN distribution through Cloudflare's network
- **Cost-Effective:** R2's pricing model with no egress fees
- **Simplified Deployment:** No need to bundle reference images with applications

## R2 Bucket Configuration

### Bucket Details
- **Bucket Name:** `mystica-assets`
- **Storage Class:** Standard
- **Region:** Auto (Cloudflare automatically distributes)
- **Directory Structure:**
  ```
  mystica-assets/
  └── image-refs/
      ├── IMG_0821.png
      ├── IMG_2791.png
      ├── IMG_4317.png
      ├── IMG_5508.png
      ├── IMG_9455.png
      └── archive/
          ├── IMG_3838.png
          └── IMG_5858.png
  ```

### Access Configuration
**Current Status:** ✅ Public access enabled via R2.dev subdomain

**Public URL Base:** `https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/`

**Enabled via Wrangler CLI:**
```bash
wrangler r2 bucket dev-url enable mystica-assets -y
```

**Public URL Format:**
- **R2.dev (active):** `https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/image-refs/IMG_0821.png`
- With custom domain (future): `https://assets.mystica.app/image-refs/IMG_0821.png`

## Setup Instructions

### 1. Install Wrangler CLI

```bash
# Install globally
npm install -g wrangler

# Or use pnpm
pnpm add -g wrangler

# Authenticate with Cloudflare
wrangler login
```

### 2. Create R2 Bucket

```bash
# Create the bucket
wrangler r2 bucket create mystica-assets

# List buckets to verify
wrangler r2 bucket list
```

### 3. Upload Reference Images

**Upload entire directory:**
```bash
# From project root
wrangler r2 object put mystica-assets --file=docs/image-refs/ --remote-path=image-refs/
```

**Upload individual files:**
```bash
# Upload specific image
wrangler r2 object put mystica-assets/image-refs/IMG_0821.png --file=docs/image-refs/IMG_0821.png

# Upload with metadata
wrangler r2 object put mystica-assets/image-refs/IMG_0821.png \
  --file=docs/image-refs/IMG_0821.png \
  --content-type=image/png
```

**Bulk upload script:**
```bash
#!/bin/bash
# Upload all images from docs/image-refs/
for file in docs/image-refs/*.png; do
  filename=$(basename "$file")
  echo "Uploading $filename..."
  wrangler r2 object put "mystica-assets/image-refs/$filename" --file="$file"
done

# Upload archive directory
for file in docs/image-refs/archive/*.png; do
  filename=$(basename "$file")
  echo "Uploading archive/$filename..."
  wrangler r2 object put "mystica-assets/image-refs/archive/$filename" --file="$file"
done
```

### 4. Verify Uploads

```bash
# List all objects in bucket
wrangler r2 object list mystica-assets

# List specific directory
wrangler r2 object list mystica-assets --prefix=image-refs/

# Get object details
wrangler r2 object info mystica-assets image-refs/IMG_0821.png
```

## Integration with generate-image.ts

### Code Changes Made

The `generate-image.ts` script was updated to only accept HTTPS URLs for reference images:

```typescript
// Validate reference image URLs
const validateReferenceImages = (imageUrls: string[]): string[] => {
  console.log(`Validating ${imageUrls.length} reference image URL(s)...`);

  for (const url of imageUrls) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error(`Invalid reference image URL: ${url}. Only HTTP/HTTPS URLs are supported.`);
    }
    console.log(`  ✓ ${url}`);
  }

  return imageUrls;
};
```

**Removed Features:**
- Local file path support for reference images
- File existence checking for local paths
- Base64 encoding of local files

### Usage Examples

**Using R2-hosted reference images:**
```bash
# With R2.dev public URLs (current setup)
npx tsx scripts/generate-image.ts --type "Magic Wand" --materials "wood,crystal" \
  -r "https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/image-refs/IMG_0821.png,https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/image-refs/IMG_4317.png"

# With all reference images
npx tsx scripts/generate-image.ts --type "Fire Staff" --materials "wood,ruby" --provider gemini \
  -r "https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/image-refs/IMG_0821.png,https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/image-refs/IMG_2791.png,https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/image-refs/IMG_4317.png,https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/image-refs/IMG_5508.png,https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/image-refs/IMG_9455.png"

# With custom domain (future setup)
npx tsx scripts/generate-image.ts --type "Ice Shield" --materials "crystal,steel" \
  -r "https://assets.mystica.app/image-refs/IMG_0821.png"
```

**Error handling for invalid URLs:**
```bash
# This will fail with validation error (local paths not supported)
npx tsx scripts/generate-image.ts --type "Ice Shield" --materials "crystal,steel" \
  -r "docs/image-refs/IMG_0821.png"
# Error: Invalid reference image URL: docs/image-refs/IMG_0821.png. Only HTTP/HTTPS URLs are supported.
```

## Environment Setup

### Required Tools
- **Wrangler CLI:** Latest version (`npm install -g wrangler`)
- **Cloudflare Account:** With R2 enabled
- **API Token:** Configured via `wrangler login`

### Environment Variables
No additional environment variables required for R2 operations when using Wrangler CLI with authenticated session.

**Optional for programmatic access:**
```bash
# .env.local (if implementing direct R2 API calls)
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
```

## Cost Considerations

### R2 Pricing (as of 2024)
- **Storage:** $0.015 per GB per month
- **Class A Operations:** $4.50 per million (write/list)
- **Class B Operations:** $0.36 per million (read)
- **Egress:** FREE (major advantage over S3)

### Estimated Costs for Mystica
**Current usage:**
- ~7 reference images (~15MB total)
- Estimated monthly cost: **< $0.01**

**Scaled usage (100 reference images, 150MB):**
- Storage: ~$0.002/month
- Operations: ~$0.01/month (assuming moderate usage)
- **Total: ~$0.02/month**

## Management Operations

### View Bucket Contents
```bash
# List all objects
wrangler r2 object list mystica-assets

# List with details
wrangler r2 object list mystica-assets --include=metadata

# List specific directory
wrangler r2 object list mystica-assets --prefix=image-refs/
```

### Download Objects
```bash
# Download single file
wrangler r2 object get mystica-assets/image-refs/IMG_0821.png --file=downloaded-image.png

# Download to specific location
wrangler r2 object get mystica-assets/image-refs/IMG_0821.png --file=./backup/IMG_0821.png
```

### Delete Objects
```bash
# Delete single object
wrangler r2 object delete mystica-assets/image-refs/old-image.png

# Delete multiple objects (be careful!)
wrangler r2 object delete mystica-assets/image-refs/IMG_0821.png mystica-assets/image-refs/IMG_4317.png
```

### Update/Replace Objects
```bash
# Overwrite existing object
wrangler r2 object put mystica-assets/image-refs/IMG_0821.png --file=docs/image-refs/IMG_0821.png

# Upload new version with different content-type
wrangler r2 object put mystica-assets/image-refs/new-image.jpg \
  --file=new-image.jpg \
  --content-type=image/jpeg
```

## Setting Up Public Access

### Option 1: R2.dev Subdomain (Quick)
1. Cloudflare Dashboard → R2 → `mystica-assets` → Settings
2. Enable "Public Access"
3. Use the provided `pub-[hash].r2.dev` URL

### Option 2: Custom Domain (Recommended)
1. Add a CNAME record in your DNS:
   ```
   assets.mystica.app CNAME mystica-assets.r2.cloudflarestorage.com
   ```
2. In R2 bucket settings, add custom domain: `assets.mystica.app`
3. Configure SSL certificate (automatic with Cloudflare)

**Benefits of Custom Domain:**
- Branded URLs
- Better caching control
- Integration with Cloudflare features (Workers, analytics)
- More professional appearance

## Security Considerations

### Current Security Model
- **Private Bucket:** Objects not publicly accessible by default
- **Authenticated Access:** Requires Cloudflare API credentials
- **Selective Sharing:** Can generate signed URLs for temporary access

### Public Access Implications
- **Read-Only:** Enable public reads for reference images
- **No Write Access:** Upload/modify operations require authentication
- **CORS Configuration:** May need CORS headers for browser access

### Best Practices
1. **Separate Buckets:** Consider separate buckets for public vs. private assets
2. **Access Policies:** Use IAM for granular permissions
3. **Monitoring:** Enable R2 analytics for usage tracking
4. **Backup Strategy:** Regular backups of critical reference images

## Troubleshooting

### Common Issues

**Authentication Errors:**
```bash
# Re-authenticate with Cloudflare
wrangler logout
wrangler login
```

**Upload Failures:**
```bash
# Check file exists and permissions
ls -la docs/image-refs/IMG_0821.png

# Try with explicit content-type
wrangler r2 object put mystica-assets/image-refs/IMG_0821.png \
  --file=docs/image-refs/IMG_0821.png \
  --content-type=image/png
```

**Missing Objects:**
```bash
# Verify object exists
wrangler r2 object info mystica-assets image-refs/IMG_0821.png

# List all objects to check naming
wrangler r2 object list mystica-assets --prefix=image-refs/
```

### Debugging Commands
```bash
# Check Wrangler version
wrangler --version

# Verify authentication
wrangler whoami

# Test bucket access
wrangler r2 bucket list

# Check object metadata
wrangler r2 object info mystica-assets image-refs/IMG_0821.png
```

## Migration from Local Files

### For Existing Scripts
If you have scripts using local file paths, update them to use R2 URLs:

**Before:**
```bash
npx tsx scripts/generate-image.ts --type "Magic Wand" --materials "wood,crystal" \
  -r "docs/image-refs/IMG_0821.png"
```

**After:**
```bash
npx tsx scripts/generate-image.ts --type "Magic Wand" --materials "wood,crystal" --provider gemini \
  -r "https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/image-refs/IMG_0821.png"
```

### Batch URL Conversion
Create a mapping file for easy reference:

```json
{
  "IMG_0821.png": "https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/image-refs/IMG_0821.png",
  "IMG_2791.png": "https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/image-refs/IMG_2791.png",
  "IMG_4317.png": "https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/image-refs/IMG_4317.png",
  "IMG_5508.png": "https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/image-refs/IMG_5508.png",
  "IMG_9455.png": "https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/image-refs/IMG_9455.png"
}
```

**All References (for copy-paste in commands):**
```
https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/image-refs/IMG_0821.png,https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/image-refs/IMG_2791.png,https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/image-refs/IMG_4317.png,https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/image-refs/IMG_5508.png,https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/image-refs/IMG_9455.png
```

## Next Steps

1. ✅ **Public Access Configured:** R2.dev subdomain enabled (`pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev`)
2. ✅ **Reference Images Uploaded:** All 5 images in `image-refs/` directory
3. **Configure Custom Domain:** Set up `assets.mystica.app` for cleaner URLs (optional)
4. **CI/CD Integration:** Add R2 upload steps to deployment pipeline
5. **Monitoring:** Set up alerts for R2 usage and costs
6. **Backup Strategy:** Implement automated backups of reference images

## Related Documentation

- [AI Image Generation Workflow](../ai-image-generation-workflow.md) - Complete workflow with examples
- [Replicate Image Generation](./replicate.md) - AI image generation service
- [Gemini Image Generation](./gemini-image-generation.md) - Google's image generation model
- `scripts/generate-image.ts` - Main image generation script
- `scripts/README.md` - Scripts documentation

## External Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [R2 Custom Domains](https://developers.cloudflare.com/r2/get-started/public-bucket/)