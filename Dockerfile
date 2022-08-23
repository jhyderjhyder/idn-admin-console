### STAGE 1: Build ###
FROM nginx:1.17.1-alpine AS build
RUN apk add --update nodejs nodejs-npm
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build-prod

### STAGE 2: Run ###
FROM nginx:1.17.1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/idn-admin-console /usr/share/nginx/html
