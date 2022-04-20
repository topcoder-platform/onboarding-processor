# Use the base image with Node.js 14.17.6
FROM node:14.19.1

# Setup Java to be used by informix-wrapper
RUN apt-get update && apt-get install -y openjdk-8-jdk

# Set working directory for future use
WORKDIR /onboarding-processor

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files from host computer to the container
COPY . ./

# Run the app
CMD [ "npm", "start" ]
