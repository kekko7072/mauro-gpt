#!/bin/bash

# Ollama
ollama serve &
ollama list
ollama pull phi3

# Express 
npm run server