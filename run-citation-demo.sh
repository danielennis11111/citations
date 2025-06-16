#!/bin/bash

# Run the citation demo
echo "Starting Citation Demo..."
echo "Once the server is running, navigate to http://localhost:3000/citations"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the development server
npm start 