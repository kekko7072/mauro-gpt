#!/bin/bash

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker daemon is not running. Starting Docker..."
    
    # Start Docker
    open -a Docker

    # Wait for Docker to initialize
    echo "Waiting for Docker to start..."
    sleep 5
else
    echo "Docker is already running."
fi

# Build Docker image
docker build -t mauro-gpt .

# Run Docker container
docker run -p 8080:8080 mauro-gpt