#!/bin/bash
# Stop ClawHub server and tunnel
# Usage: ./stop.sh

PIDS_FILE="/tmp/clawhub-pids.txt"

if [ -f "$PIDS_FILE" ]; then
    read WEB_PID NGROK_PID < "$PIDS_FILE"
    echo "🛑 Stopping ClawHub..."
    [ -n "$WEB_PID" ] && kill $WEB_PID 2>/dev/null && echo "   Web server stopped"
    [ -n "$NGROK_PID" ] && kill $NGROK_PID 2>/dev/null && echo "   Ngrok stopped"
    rm -f "$PIDS_FILE"
else
    echo "No running ClawHub processes found"
fi
