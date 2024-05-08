# Use the specified Ollama image
FROM ollama/ollama:latest

# Set environment variables to non-interactive (this avoids some prompts)
ENV DEBIAN_FRONTEND=noninteractive

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install Python 3.9
#RUN apt-get update && apt-get install -y python3 && \
#    apt-get install -y python3-pip

#RUN python3 --version && pip --version

# Clean up to reduce image size
#RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Pull phi3 inside
#COPY elaborate_model.sh elaborate_model.sh
#RUN chmod +x elaborate_model.sh
#RUN ./elaborate_model.sh

# Install Node.js and TypeScript
RUN apt-get update && apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g typescript && \
    npm install && \
    npm run build

# Make port 3000 available to the world outside this container
EXPOSE 8080

# Define environment variable
ENV NODE_ENV=production

# Set the entrypoint script to be executed
COPY execute.sh execute.sh
RUN chmod +x execute.sh

ENTRYPOINT ["./execute.sh"]