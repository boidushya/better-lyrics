#!/bin/bash
# Build script to minify the JavaScript file and create a zip file for the extension
# Requires jq and terser to be installed (npm install -g jq terser)

set -e

CURRENT_DIR=$(pwd)
TEMP_DIR=$(mktemp -d)

cp -r images src manifest.json $TEMP_DIR

cd $TEMP_DIR

terser src/index.js -c -m -o src/index.min.js && rm src/index.js

jq '.content_scripts[0].js = ["src/index.min.js"]' manifest.json > manifest.json.tmp && mv manifest.json.tmp manifest.json

zip -r better-lyrics.zip ./* -x "./dist/*" "LICENSE" "README.md" "build.sh"

mkdir -p $CURRENT_DIR/dist

mv better-lyrics.zip $CURRENT_DIR/dist/better-lyrics.zip

cd ..
rm -rf $TEMP_DIR
