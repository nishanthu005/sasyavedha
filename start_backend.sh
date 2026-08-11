#!/bin/bash
echo "🌱 Starting AgroMind AI Backend..."
cd "$(dirname "$0")/backend"
pip install -r requirements.txt -q
python app.py
