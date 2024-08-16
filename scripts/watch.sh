#!/bin/bash
# A utility script to watch for changes in the current directory and send a request to the extensions page to reload the extension
# Requires fswatch to be installed:
# brew install fswatch

# Define colors
COLOR_SUCCESS="\033[0;32m" # Green
COLOR_ERROR="\033[0;31m"   # Red
COLOR_LOG="\033[0;34m"     # Blue
COLOR_RESET="\033[0m"      # Reset

# Directories and files to exclude
EXCLUDE_DIRS=(".git" "www" "dist" "scripts" "node_modules")
EXCLUDE_FILES=("*.log" "*.tmp" "*.bak")

# Function to check if a path should be excluded
should_exclude() {
	local path="$1"

	# Exclude specific directories
	for dir in "${EXCLUDE_DIRS[@]}"; do
		if [[ "$path" =~ /$dir/ ]]; then
			return 0
		fi
	done

	# Exclude specific file types
	for file in "${EXCLUDE_FILES[@]}"; do
		if [[ "$path" =~ $file$ ]]; then
			return 0
		fi
	done

	# Exclude dotfiles and dotfolders
	if [[ "$path" =~ /\.[^/]*$ ]]; then
		return 0
	fi

	return 1
}

# Command to open the URL in default browser
open_url() {
	if [[ "$OSTYPE" == "darwin"* ]]; then
		open "http://reload.extensions" -g
	elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
		xdg-open "http://reload.extensions"
	else
		echo -e "${COLOR_ERROR}Unsupported operating system${COLOR_RESET}"
		exit 1
	fi
}

# Trap Ctrl+C to exit gracefully
trap 'echo -e "\n${COLOR_LOG}Stopping file watching...${COLOR_RESET}"; exit 0' INT

# Start fswatch to monitor changes
echo -e "${COLOR_LOG}Monitoring directory $(pwd) for changes...${COLOR_RESET}"
echo -e "${COLOR_LOG}Press Ctrl+C to stop${COLOR_RESET}"

fswatch -r . | while read -r changed_path; do
	if ! should_exclude "$changed_path"; then
		echo -e "${COLOR_SUCCESS}Change detected in:${COLOR_RESET} $changed_path"
		open_url
	else
		echo -e "${COLOR_ERROR}Change detected in excluded path:${COLOR_RESET} $changed_path (skipping)"
	fi
done
