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

# Copy root-level management scripts
echo "✓ Copying management scripts..."
cp "${SCRIPT_DIR}/check-project.sh" "${DOCS_DIR}/"
cp "${SCRIPT_DIR}/generate-docs.sh" "${DOCS_DIR}/"
cp "${SCRIPT_DIR}/list-apis.sh" "${DOCS_DIR}/"

# Copy subdirectory list scripts
cp "${SCRIPT_DIR}/user-flows/list-flows.sh" "${DOCS_DIR}/user-flows/"
cp "${SCRIPT_DIR}/user-stories/list-stories.sh" "${DOCS_DIR}/user-stories/"
cp "${SCRIPT_DIR}/feature-spec/list-features.sh" "${DOCS_DIR}/feature-specs/"

# Copy CLAUDE guide
echo "✓ Copying CLAUDE guide..."
cp "${SCRIPT_DIR}/CLAUDE.template.md" "${DOCS_DIR}/CLAUDE.md"

# Make all scripts executable
echo "✓ Making scripts executable..."
chmod +x "${DOCS_DIR}"/*.sh
chmod +x "${DOCS_DIR}/user-flows"/*.sh
chmod +x "${DOCS_DIR}/user-stories"/*.sh
chmod +x "${DOCS_DIR}/feature-specs"/*.sh

echo ""
echo "✅ Project documentation setup complete!"
echo ""
echo "Next steps:"
echo "  1. Review CLAUDE.md in ${DOCS_DIR}/"
echo "  2. Run: cd ${DOCS_DIR} && ./check-project.sh --help"
echo "  3. Begin with product-requirements.yaml (agent will generate from templates)"
echo ""

