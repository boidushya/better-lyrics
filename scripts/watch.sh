#!/bin/bash
# A utility script to watch for changes in the current directory and send a request to the extensions page to reload the extension
# Requires fswatch to be installed:
# brew install fswatch

# Define colors
COLOR_SUCCESS="\033[0;32m" # Green
COLOR_ERROR="\033[0;31m"   # Red
COLOR_LOG="\033[0;34m"     # Blue
COLOR_RESET="\033[0m"      # Reset

# Function to check if a path should be excluded
should_exclude() {
	local path="$1"

	# Exclude files/dirs inside dist and scripts folders
	if [[ "$path" =~ /dist/ || "$path" =~ /scripts/ ]]; then
		return 0
	fi

	# Exclude dotfiles and dotfolders
	if [[ "$path" =~ /\.[^/]*$ ]]; then
		return 0
	fi

	return 1
}

# Command to open the URL in default browser
open_url() {
	open "http://reload.extensions" -g
}

# Start fswatch to monitor changes
echo -e "${COLOR_LOG}Monitoring directory $(pwd) for changes...${COLOR_RESET}"
fswatch . |
	while read -r changed_path; do
		if ! should_exclude "$changed_path"; then
			echo -e "${COLOR_SUCCESS}Change detected in:${COLOR_RESET} $changed_path"
			open_url
		else
			echo -e "${COLOR_ERROR}Change detected in excluded path:${COLOR_RESET} $changed_path (skipping)"
		fi
	done
