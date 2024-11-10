#!/bin/bash

# Detect the operating system
OS="$(uname)"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker daemon is not running. Starting Docker..."

    case "$OS" in
        "Darwin")
            # macOS
            open -a Docker
            ;;
        "Linux")
            # Linux - Assume systemd (common on modern distributions)
            if [ -x "$(command -v systemctl)" ]; then
                sudo systemctl start docker
            else
                echo "Please start Docker manually."
                exit 1
            fi
            ;;
        "MINGW"*|"CYGWIN"*|"MSYS_NT"*)
            # Windows (Git Bash or similar)
            echo "Please start Docker Desktop manually on Windows."
            ;;
        *)
            echo "Unsupported operating system: $OS"
            exit 1
            ;;
    esac

    # Wait for Docker to initialize
    echo "Waiting for Docker to start..."
    sleep 10
else
    echo "Docker is already running."
fi

# Build Docker image
docker build -t mauro-gpt .

# Run Docker container
docker run -p 8080:8080 mauro-gpt
