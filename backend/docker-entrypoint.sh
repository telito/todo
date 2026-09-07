#!/bin/sh
set -e

cd /app

echo "Installing backend dependencies..."
npm install

echo "Starting: $*"
exec "$@"
