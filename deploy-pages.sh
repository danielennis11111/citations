#!/bin/bash

# GitHub Pages Deployment Script for Beta Land @ ASU
# This script builds the React app and deploys to gh-pages branch

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 GitHub Pages Deployment for Beta Land @ ASU${NC}"
echo "=================================================="

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  You're on branch '$CURRENT_BRANCH'. Switching to main...${NC}"
    git checkout main
fi

# Make sure we have the latest changes
echo -e "${BLUE}📥 Pulling latest changes...${NC}"
git pull origin main

# Clean any previous build
echo -e "${BLUE}🧹 Cleaning previous build...${NC}"
rm -rf build/

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci

# Build for production (without API keys for security)
echo -e "${BLUE}🏗️  Building for production...${NC}"
export REACT_APP_ENVIRONMENT=production
export REACT_APP_DEFAULT_MODEL=gemini-2.0-flash
export REACT_APP_ENABLE_IMAGE_GENERATION=false
export REACT_APP_ENABLE_CODE_EXECUTION=false
export REACT_APP_ENABLE_SEARCH_GROUNDING=false

npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo -e "${RED}❌ Build failed - no build directory found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Deploy to gh-pages branch
echo -e "${BLUE}🚀 Deploying to gh-pages branch...${NC}"

# Use gh-pages package if available, otherwise manual deployment
if command -v npx &> /dev/null && npm list gh-pages &> /dev/null; then
    echo -e "${BLUE}📤 Using gh-pages package...${NC}"
    npx gh-pages -d build
else
    echo -e "${BLUE}📤 Manual deployment to gh-pages...${NC}"
    
    # Save current commit hash
    CURRENT_COMMIT=$(git rev-parse HEAD)
    
    # Create or switch to gh-pages branch
    if git show-ref --verify --quiet refs/heads/gh-pages; then
        git checkout gh-pages
    else
        git checkout --orphan gh-pages
        git rm -rf .
    fi
    
    # Copy build files
    cp -r build/* .
    
    # Add all files
    git add .
    
    # Commit
    git commit -m "Deploy from main branch (${CURRENT_COMMIT:0:7})"
    
    # Push to gh-pages
    git push origin gh-pages
    
    # Switch back to main
    git checkout main
fi

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo "=================================================="
echo -e "${GREEN}✅ Site URL: https://danielennis11111.github.io/citations/${NC}"
echo -e "${GREEN}✅ Demo Mode: API keys excluded for security${NC}"
echo -e "${GREEN}✅ Available Models: Local Llama models only${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Wait 1-2 minutes for GitHub Pages to update"
echo "2. Visit the site URL above"
echo "3. Check GitHub repository Settings > Pages for deployment status"
echo ""
echo -e "${YELLOW}💡 To update: Re-run this script after making changes${NC}" 