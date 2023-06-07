#!/bin/sh

docker buildx build . --platform linux/amd64,linux/arm64,linux/arm/v7 --push -t dadaamater/iaqualink-proxy:latest
