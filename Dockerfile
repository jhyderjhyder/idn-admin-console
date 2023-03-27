### STAGE 1: Build ###

# Use official nginx and node tested image as the base image
FROM node:18.15.0 AS build

# Set the working directory
WORKDIR /usr/src/app

# Add the source code to app
COPY package.json ./

# Install all the dependencies
RUN npm install

# Copy Files
COPY . .

# Generate the build of the application
RUN npm run build

### STAGE 2: Run ###

# Use official nginx tested image as the base image
FROM nginx:stable-alpine

# Copy the build output to replace the default nginx contents.
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/idn-admin-console /usr/share/nginx/html
