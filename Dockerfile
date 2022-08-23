### STAGE 1: Build ###
FROM nginx:1.17.1-alpine AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN apt-get update && apt-get upgrade -y && apt-get install -y nodejs npm
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build-prod

### STAGE 2: Run ###
FROM nginx:1.17.1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/idn-admin-console /usr/share/nginx/html
