### STAGE 1: Build ###

# Use official nginx and node tested image as the base image
FROM node:18.15.0 AS build
LABEL stage=builder
# Set the working directory
WORKDIR /usr/src/app

# Add the source code to app
COPY package.json ./

# Install all the dependencies
RUN npm install
RUN npm install -g npm@9.7.2
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

#Adding SSH for azure container
COPY sshd_config /etc/ssh/
COPY entrypoint.sh ./

# Start and enable SSH for Azure Web
RUN apk add openssh \
    && echo "root:Docker!" | chpasswd \
    && chmod +x ./entrypoint.sh \
    && cd /etc/ssh/ \
    && ssh-keygen -A

EXPOSE 8080 2222

# If not using Azure Web app remove this line
ENTRYPOINT [ "./entrypoint.sh" ]
#Prune image files
#sudo docker image prune --filter label=stage=builder