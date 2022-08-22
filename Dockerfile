FROM nginx:1.17.1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY /home/runner/work/idn-admin-console/idn-admin-console /usr/share/nginx/html
