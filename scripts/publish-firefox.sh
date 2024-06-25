#!/bin/bash

# bash script to publish the firefox version of the package to firefox store
# Usage: bash scripts/publish-firefox.sh
# Requires: https://github.com/aklinker1/publish-browser-extension

npm install -g publish-browser-extension

FIREFOX_CHANNEL="listed"

# Check if all required environment variables are set

if [ -z "$FIREFOX_EXTENSION_ID" ]; then
	echo "FIREFOX_EXTENSION_ID is not set"
	exit 1
fi

if [ -z "$FIREFOX_JWT_ISSUER" ]; then
	echo "FIREFOX_JWT_ISSUER is not set"
	exit 1
fi

if [ -z "$FIREFOX_JWT_SECRET" ]; then
	echo "FIREFOX_JWT_SECRET is not set"
	exit 1
fi

# Check if the zip files exist

if [ ! -f "./dist/better-lyrics-firefox.zip" ]; then
	echo "Firefox zip file does not exist"
	exit 1
fi

if [ ! -f "./dist/better-lyrics-src.zip" ]; then
	echo "Firefox sources zip file does not exist"
	exit 1
fi

publish-extension \
	--firefox-zip dist/better-lyrics-firefox.zip --firefox-sources-zip dist/better-lyrics-src.zip \
