#!/bin/bash
# Start ClawHub with public access via ngrok
# Usage: ./start-with-tunnel.sh [port]

PORT=${1:-3000}
PROJECT_DIR="/root/.openclaw/workspace/clawhub-clone"

echo "🚀 Starting ClawHub Clone..."
echo "📍 Port: $PORT"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "📦 Installing ngrok..."
    curl -s https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz | tar xz -C /usr/local/bin
fi

# Start web server in background
cd "$PROJECT_DIR"
echo "🌐 Starting web server..."
npm run dev:web > /tmp/clawhub-web.log 2>&1 &
WEB_PID=$!
echo "   Web PID: $WEB_PID"

# Wait for server to start
echo "⏳ Waiting for server..."
for i in {1..30}; do
    if curl -s http://localhost:$PORT > /dev/null 2>&1; then
        echo "   Server is ready!"
        break
    fi
    sleep 1
done

# Start ngrok tunnel
echo "🔗 Starting ngrok tunnel..."
ngrok http $PORT --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!
echo "   Ngrok PID: $NGROK_PID"

# Wait for ngrok to create tunnel
sleep 3

# Get public URL
PUBLIC_URL=$(grep -o 'url=https://[^[:space:]]*' /tmp/ngrok.log | head -1 || echo "Waiting...")
echo ""
echo "✅ ClawHub Clone is running!"
echo ""
echo "📍 Local:   http://localhost:$PORT"
echo "🌐 Public:  $PUBLIC_URL"
echo ""
echo "To stop: kill $WEB_PID $NGROK_PID"
echo ""

# Save PIDs for later
echo "$WEB_PID $NGROK_PID" > /tmp/clawhub-pids.txt

# Follow logs
echo "📋 Press Ctrl+C to stop following logs (server keeps running)"
tail -f /tmp/ngrok.log /tmp/clawhub-web.log 2>/dev/null
