#!/bin/bash

(cd ./server && docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d)
(cd ./client && docker compose up -d --build)
