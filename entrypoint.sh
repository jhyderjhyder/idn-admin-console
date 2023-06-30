#!/bin/sh
set -e
/usr/sbin/sshd
./docker-entrypoint.sh
nginx -g 'daemon off;'
tail -f ./docker-entrypoint.sh
