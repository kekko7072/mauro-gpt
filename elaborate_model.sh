#!/bin/bash

# Ollama
ollama serve &
ollama list
ollama pull phi3
ollama pull nomic-embed-text

# Elaborate the model
#cd embedding
#pip install -r requirements.txt
#python3 create_model_embedding.py






