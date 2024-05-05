# Use the specified Ollama image
FROM ollama/ollama:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install netcat
RUN apt-get update && apt-get install -y netcat

# Install Node.js and TypeScript
RUN apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g typescript && \
    npm install && \
    npm run build

# Make port 3000 available to the world outside this container
EXPOSE 8080

# Define environment variable
ENV NODE_ENV=production

# Copy the entrypoint script and make it executable
COPY entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh

# Set the entrypoint script to be executed
ENTRYPOINT ["./entrypoint.sh"]