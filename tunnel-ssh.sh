#!/bin/bash
# SSH tunnel for ClawHub Clone
# Run this on your Mac to access server localhost:3000 as localhost:3000

# Configuration - update these
SERVER_HOST="root@YOUR_SERVER_IP"  # Your server IP/hostname
SERVER_PORT=3000                   # Port on server
LOCAL_PORT=3000                    # Port on your Mac

echo "🔗 Creating SSH tunnel..."
echo "   Server: $SERVER_HOST:$SERVER_PORT"
echo "   Local:  localhost:$LOCAL_PORT"
echo ""
echo "After connecting, open: http://localhost:$LOCAL_PORT"
echo ""
echo "To stop: Ctrl+C"
echo ""

# SSH tunnel with auto-close on Ctrl+C
ssh -N -L localhost:$LOCAL_PORT:localhost:$SERVER_PORT $SERVER_HOST
