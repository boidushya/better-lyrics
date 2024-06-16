#!/bin/bash

SCRIPT_DIR=$(dirname "$0")

# Loop through all files in the script directory that start with "build-"
for script in "$SCRIPT_DIR"/build-*; do
  # Check if the file exists to avoid errors if no files match the pattern
  if [[ -f "$script" ]]; then
    echo "Running $script..."
    bash "$script"
  else
    echo "No build scripts found."
  fi
done