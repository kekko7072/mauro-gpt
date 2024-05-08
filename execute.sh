#!/bin/bash

# Ollama [already installed in the Dockerfile, here for making sure it is installed]
ollama serve &
ollama list
ollama pull phi3
ollama pull nomic-embed-text

# Express 
npm run server