#!/bin/sh

docker buildx build . --platform linux/amd64,linux/arm64 --push -t dadaamater/iaqualink-proxy:latest
