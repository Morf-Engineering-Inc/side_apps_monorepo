#!/bin/bash
set -euo pipefail

# Build Lambda functions and layers for AWS deployment
# This script packages Lambda functions and creates the required zip files

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LAMBDA_DIR="$REPO_ROOT/lambda"

echo "Building Lambda functions and layers..."
echo "Repository root: $REPO_ROOT"

# Create temporary build directories
BUILD_DIR="$REPO_ROOT/.build"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Build Lambda Layer (dependencies)
echo ""
echo "📦 Building Lambda layer: dependencies"
LAYER_BUILD_DIR="$BUILD_DIR/layer"
mkdir -p "$LAYER_BUILD_DIR/nodejs"

cd "$LAMBDA_DIR/layers"
if [ -f package.json ]; then
  # Copy package.json to layer build directory
  cp package.json "$LAYER_BUILD_DIR/nodejs/"
  
  # Install dependencies if any are defined
  cd "$LAYER_BUILD_DIR/nodejs"
  # Check if package.json has dependencies using node (more reliable than grep)
  HAS_DEPS=$(node -pe "Object.keys(require('./package.json').dependencies || {}).length > 0")
  if [ "$HAS_DEPS" = "true" ]; then
    echo "Installing layer dependencies..."
    npm install --production --no-package-lock
  fi
fi

# Create the layer zip file
cd "$LAYER_BUILD_DIR"
if [ -d nodejs ] && [ -n "$(ls -A nodejs)" ]; then
  zip -r "$LAMBDA_DIR/layers/dependencies.zip" nodejs
  echo "✅ Created dependencies.zip"
else
  # Create an empty layer zip with just the structure
  mkdir -p nodejs
  zip -r "$LAMBDA_DIR/layers/dependencies.zip" nodejs
  echo "✅ Created empty dependencies.zip"
fi

# Function to build a Lambda function
build_function() {
  local function_name=$1
  local function_dir="$LAMBDA_DIR/functions/$function_name"
  local function_build_dir="$BUILD_DIR/$function_name"
  
  echo ""
  echo "📦 Building Lambda function: $function_name"
  
  # Create build directory
  mkdir -p "$function_build_dir"
  
  # Copy function code
  cp "$function_dir/index.js" "$function_build_dir/"
  
  # Copy shared utilities if they exist
  if [ -d "$LAMBDA_DIR/shared" ]; then
    mkdir -p "$function_build_dir/shared"
    # Copy .js files, verify at least one was copied
    if ls "$LAMBDA_DIR/shared"/*.js 1> /dev/null 2>&1; then
      cp "$LAMBDA_DIR/shared"/*.js "$function_build_dir/shared/"
      echo "  Copied shared utilities"
    else
      echo "  Warning: No .js files found in shared directory"
    fi
  fi
  
  # Create zip file in the functions directory (not inside the function subdirectory)
  cd "$function_build_dir"
  zip -r "$LAMBDA_DIR/functions/${function_name}.zip" .
  
  echo "✅ Created ${function_name}.zip"
}

# Build each Lambda function
build_function "api-handler"
build_function "auth-handler"
build_function "stripe-handler"

# Clean up build directory
rm -rf "$BUILD_DIR"

echo ""
echo "✅ Lambda build complete!"
echo ""
echo "Generated files:"
echo "  - lambda/layers/dependencies.zip"
echo "  - lambda/functions/api-handler.zip"
echo "  - lambda/functions/auth-handler.zip"
echo "  - lambda/functions/stripe-handler.zip"
