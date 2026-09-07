#!/bin/sh
set -e

cd /app

echo "Installing frontend dependencies..."
npm install

echo "Starting: $*"
exec "$@"
