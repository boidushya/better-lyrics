#!/bin/bash

# Loop through all files in the current directory that start with "manifest" and use jq to bump the version number to whatever is passed in as the first argument

# Check if the first argument is empty
if [[ -z "$1" ]]; then
	echo "Please provide a version number."
	exit 1
fi

for manifest in $(find . -name "manifest*.json"); do
	# Check if the file exists to avoid errors if no files match the pattern
	if [[ -f "$manifest" ]]; then
		jq --arg version "$1" '.version = $version' "$manifest" >"$manifest.tmp" && mv "$manifest.tmp" "$manifest"
	else
		echo "No manifest files found."
	fi
done

# Update the version in the README file
if [[ -f "README.md" ]]; then
	sed -i '' "s/version-[0-9]*\.[0-9]*\.[0-9]*/version-$1/" README.md
else
	echo "README.md file not found."
fi

# Update the version in src/options.html
if [[ -f "src/options/options.html" ]]; then
	sed -i '' "s/v[0-9]*\.[0-9]*\.[0-9]*/v$1/" src/options/options.html
else
	echo "src/options/options.html file not found."
fi

# Run biome lint and format after bumping the version
npx @biomejs/biome lint --fix
npx @biomejs/biome format --fix
