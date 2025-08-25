#!/bin/bash

# Aoife & Aine's Space Defense Game
# Start script to run the web server

echo "🛸 Starting Aoife & Aine's Space Defense Game! 🌍"
echo ""
echo "Game will be available at:"
echo "  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"
echo ""

# Kill any process using port 8000
pkill -f "python3 -m http.server 8000" 2>/dev/null || true

# Start Python HTTP server on port 8000
python3 -m http.server 8000