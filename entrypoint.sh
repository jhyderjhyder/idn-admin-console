#!/bin/sh
set -e
/usr/sbin/sshd
./docker-entrypoint.sh
nginx -g 'daemon off;'
