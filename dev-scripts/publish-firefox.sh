#!/bin/bash

# bash script to publish the firefox version of the package to firefox store
# Usage: bash dev-scripts/publish-firefox.sh
# Requires: web-ext

npm install -g web-ext

# Load environment variables from .env file

if [ -f .env ]; then
	export $(cat .env | xargs)
else
	echo "Error: .env file not found."
fi

# unzip dist/better-lyrics-firefox.zip to a temp directory

TEMP_DIR=$(mktemp -d)

unzip dist/better-lyrics-firefox.zip -d $TEMP_DIR

cd $TEMP_DIR

# try to sign the extension, catch any errors

web-ext sign \
	--channel=listed \
	--api-key=$FIREFOX_JWT_ISSUER \
	--api-secret=$FIREFOX_JWT_SECRET \
	--upload-source-code || {
	echo "Error: Failed to sign the extension. Exiting gracefully."
	exit 0
}
