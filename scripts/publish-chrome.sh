#!/bin/bash

# bash script to publish the chrome version of the package to chrome store
# Usage: bash scripts/publish-chrome.sh
# Requires: npm install -g chrome-webstore-upload-cli

chrome-webstore-upload upload \
	--source ./dist/better-lyrics-chrome.zip \
	--extension-id $EXTENSION_ID \
	--client-id $CLIENT_ID \
	--client-secret $CLIENT_SECRET \
	--refresh-token $REFRESH_TOKEN
