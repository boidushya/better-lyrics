#!/bin/bash

# bash script to publish the chrome version of the package to chrome store
# Usage: bash dev-scripts/publish-chrome.sh
# Requires: npm install -g chrome-webstore-upload-cli

npm install -g chrome-webstore-upload-cli

# Load environment variables from .env file
if [ -f .env ]; then
	export $(cat .env | xargs)
else
	echo -e "${COLOR_ERROR}Error: .env file not found.${COLOR_RESET}"
fi

# Check if all required environment variables are set

if [ -z "$EXTENSION_ID" ]; then
	echo "EXTENSION_ID is not set"
	exit 1
fi

if [ -z "$CLIENT_ID" ]; then
	echo "CLIENT_ID is not set"
	exit 1
fi

if [ -z "$CLIENT_SECRET" ]; then
	echo "CLIENT_SECRET is not set"
	exit 1
fi

if [ -z "$REFRESH_TOKEN" ]; then
	echo "REFRESH_TOKEN is not set"
	exit 1
fi

# Check if the zip file exists

if [ ! -f "./dist/better-lyrics-chrome.zip" ]; then
	echo "Chrome zip file does not exist"
	exit 1
fi

# Upload the package

chrome-webstore-upload upload \
	--source ./dist/better-lyrics-chrome.zip \
	--extension-id $EXTENSION_ID \
	--client-id $CLIENT_ID \
	--client-secret $CLIENT_SECRET \
	--refresh-token $REFRESH_TOKEN || {
	echo "Error: Failed to upload the extension. Exiting gracefully."
	exit 0
}

# Publish the package

chrome-webstore-upload publish --extension-id $EXTENSION_ID \
	--client-id $CLIENT_ID \
	--client-secret $CLIENT_SECRET \
	--refresh-token $REFRESH_TOKEN || {
	echo "Error: Failed to publish the extension. Exiting gracefully."
	exit 0
}
