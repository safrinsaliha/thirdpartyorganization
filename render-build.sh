#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing Node.js dependencies and building Angular Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Installing Python dependencies..."
pip install -r backend/requirements.txt
