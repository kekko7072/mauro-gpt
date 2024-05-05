#!/bin/bash

# Ollama
ollama serve &
ollama list
ollama pull phi3

# Run your Node.js application
exec npm run server
