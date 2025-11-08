#!/bin/bash
# Cloudflare Pages Build Script
# This script ensures the build runs correctly

echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

echo "Build complete! Output directory: build/"

