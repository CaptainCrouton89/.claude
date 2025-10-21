#!/usr/bin/env bash
# Setup Project Documentation
# Run from project root: bash ~/.claude/file-templates/init-project/setup-project-docs.sh

set -e

# Determine script location (where templates live)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Target is current working directory (where script was invoked)
PROJECT_ROOT="$(pwd)"
DOCS_DIR="${PROJECT_ROOT}/docs"

echo "📚 Setting up project documentation..."
echo "   Templates from: ${SCRIPT_DIR}"
echo "   Project root: ${PROJECT_ROOT}"
echo "   Target docs: ${DOCS_DIR}"
echo ""

# Create docs directory if it doesn't exist
if [ ! -d "${DOCS_DIR}" ]; then
  echo "✓ Creating docs directory..."
  mkdir -p "${DOCS_DIR}"
else
  echo "✓ Using existing docs directory"
fi

# Create subdirectories for multi-file docs
echo "✓ Creating subdirectories..."
mkdir -p "${DOCS_DIR}/user-flows"
mkdir -p "${DOCS_DIR}/user-stories"
mkdir -p "${DOCS_DIR}/feature-specs"

# Copy TypeScript source files
echo "✓ Copying TypeScript scripts..."
cp "${SCRIPT_DIR}/yaml-parser.ts" "${DOCS_DIR}/"
cp "${SCRIPT_DIR}/check-project.ts" "${DOCS_DIR}/"
cp "${SCRIPT_DIR}/generate-docs.ts" "${DOCS_DIR}/"
cp "${SCRIPT_DIR}/list-apis.ts" "${DOCS_DIR}/"
cp "${SCRIPT_DIR}/user-flows/list-flows.ts" "${DOCS_DIR}/user-flows/"
cp "${SCRIPT_DIR}/user-stories/list-stories.ts" "${DOCS_DIR}/user-stories/"
cp "${SCRIPT_DIR}/feature-spec/list-features.ts" "${DOCS_DIR}/feature-specs/"

# Copy build configuration
echo "✓ Copying build configuration..."
cp "${SCRIPT_DIR}/package.json" "${DOCS_DIR}/"
cp "${SCRIPT_DIR}/tsconfig.json" "${DOCS_DIR}/"
cp "${SCRIPT_DIR}/.gitignore" "${DOCS_DIR}/"
cp "${SCRIPT_DIR}/run.sh" "${DOCS_DIR}/"
chmod +x "${DOCS_DIR}/run.sh"

# Copy CLAUDE guide
echo "✓ Copying CLAUDE guide..."
cp "${SCRIPT_DIR}/CLAUDE.template.md" "${DOCS_DIR}/CLAUDE.md"

# Install dependencies and build TypeScript
echo "✓ Installing dependencies..."
cd "${DOCS_DIR}"
if command -v pnpm &> /dev/null; then
  pnpm install --silent
else
  npm install --silent
fi

echo "✓ Building TypeScript scripts..."
if command -v pnpm &> /dev/null; then
  pnpm build
else
  npm run build
fi

# Make compiled scripts executable
echo "✓ Making scripts executable..."
chmod +x *.js 2>/dev/null || true
chmod +x user-flows/*.js 2>/dev/null || true
chmod +x user-stories/*.js 2>/dev/null || true
chmod +x feature-specs/*.js 2>/dev/null || true

cd "${PROJECT_ROOT}"

echo ""
echo "✅ Project documentation setup complete!"
echo ""
echo "Next steps:"
echo "  1. Review CLAUDE.md in ${DOCS_DIR}/"
echo "  2. Run: cd ${DOCS_DIR} && node check-project.js --help"
echo "  3. Begin with product-requirements.yaml (agent will generate from templates)"
echo ""
echo "Available scripts (via run.sh wrapper):"
echo "  • ./run.sh check-project -v    - Validate documentation"
echo "  • ./run.sh list-apis           - List API endpoints"
echo "  • ./run.sh generate-docs       - Generate markdown docs"
echo "  • ./run.sh list-features       - List features"
echo "  • ./run.sh list-stories        - List user stories"
echo "  • ./run.sh list-flows          - List user flows"
echo ""
echo "Or run directly with Node:"
echo "  • node check-project.js"
echo "  • node feature-specs/list-features.js"
echo ""
