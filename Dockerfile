FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# For prod environment
RUN npm ci --only=production

# Bundle source code
COPY . .

# Start the server
EXPOSE 4000
CMD [ "node", "index.js" ]