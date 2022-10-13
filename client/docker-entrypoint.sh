#!/usr/bin/env sh
set -eu

envsubst '${BACKEND_IP}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"
