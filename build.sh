#!/bin/sh
docker stop xtream-web-tv
docker rm xtream-web-tv
docker build -t xtream-web-tv .
docker compose up -d