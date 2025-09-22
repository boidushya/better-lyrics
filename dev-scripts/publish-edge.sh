#!/bin/bash

# bash script to publish the edge version of the package to edge store
# Usage: bash dev-scripts/publish-edge.sh

# Define colors
COLOR_SUCCESS="\033[0;32m" # Green
COLOR_ERROR="\033[0;31m"   # Red
COLOR_LOG="\033[0;34m"     # Blue
COLOR_RESET="\033[0m"      # Reset

# Load environment variables from .env file
if [ -f .env ]; then
	export $(cat .env | xargs)
else
	echo -e "${COLOR_ERROR}Error: .env file not found.${COLOR_RESET}"
fi

# Check if credentials are set
if [ -z "$CLIENT_ID" ] || [ -z "$API_KEY" ] || [ -z "$PRODUCT_ID" ]; then
	echo -e "${COLOR_ERROR}Error: CLIENT_ID, API_KEY, and PRODUCT_ID must be set in the .env file.${COLOR_RESET}"
	exit 1
fi

# Upload the package
echo -e "${COLOR_LOG}Uploading package...${COLOR_RESET}"
UPLOAD_RESPONSE=$(curl -v -X POST \
	-H "Authorization: ApiKey $API_KEY" \
	-H "X-ClientID: $CLIENT_ID" \
	-H "Content-Type: application/zip" \
	--data-binary @dist/better-lyrics-edge.zip \
	"https://api.addons.microsoftedge.microsoft.com/v1/products/$PRODUCT_ID/submissions/draft/package" 2>&1)

# Extract the operation ID from the Location header
OPERATION_ID=$(echo "$UPLOAD_RESPONSE" | grep -i '^< Location:' | awk '{print $3}' | tr -d '\r')

if [ -z "$OPERATION_ID" ]; then
	echo -e "${COLOR_ERROR}Error: Failed to get operation ID from upload response.${COLOR_RESET}"
	echo -e "${COLOR_ERROR}Response: $UPLOAD_RESPONSE ${COLOR_RESET}"
	exit 1
fi

echo -e "${COLOR_LOG}Operation ID: $OPERATION_ID ${COLOR_RESET}"

# Check the status of the package upload
echo -e "${COLOR_LOG}Checking upload status...${COLOR_RESET}"
while true; do
	STATUS=$(curl -s -X GET \
		-H "Authorization: ApiKey $API_KEY" \
		-H "X-ClientID: $CLIENT_ID" \
		"https://api.addons.microsoftedge.microsoft.com/v1/products/$PRODUCT_ID/submissions/draft/package/operations/$OPERATION_ID" |
		jq -r '.status')

	if [ "$STATUS" = "Succeeded" ]; then
		echo -e "${COLOR_SUCCESS}Package upload successful.${COLOR_RESET}"
		break
	elif [ "$STATUS" = "Failed" ]; then
		echo -e "${COLOR_ERROR}Package upload failed.${COLOR_RESET}"
		exit 1
	else
		echo -e "${COLOR_LOG}Upload in progress. Waiting...${COLOR_RESET}"
		sleep 10
	fi
done

# Publish the submission
echo -e "${COLOR_LOG}Publishing submission...${COLOR_RESET}"
PUBLISH_RESPONSE=$(curl -v -X POST \
	-H "Authorization: ApiKey $API_KEY" \
	-H "X-ClientID: $CLIENT_ID" \
	-H "Content-Type: application/json" \
	-d '{"notes":"Automated submission via API"}' \
	"https://api.addons.microsoftedge.microsoft.com/v1/products/$PRODUCT_ID/submissions" 2>&1)

# Extract the submission ID from the Location header
SUBMISSION_ID=$(echo "$PUBLISH_RESPONSE" | grep -i '^< Location:' | awk '{print $3}' | tr -d '\r')

if [ -z "$SUBMISSION_ID" ]; then
	echo -e "${COLOR_ERROR}Error: Failed to get submission ID from publish response.${COLOR_RESET}"
	exit 1
fi

echo -e "${COLOR_SUCCESS}Submission initiated successfully.${COLOR_RESET}"
echo -e "${COLOR_LOG}Submission ID: $SUBMISSION_ID${COLOR_RESET}"

# Check the status of the submission
echo -e "${COLOR_LOG}Checking submission status...${COLOR_RESET}"
while true; do
	STATUS_RESPONSE=$(curl -s -X GET \
		-H "Authorization: ApiKey $API_KEY" \
		-H "X-ClientID: $CLIENT_ID" \
		"https://api.addons.microsoftedge.microsoft.com/v1/products/$PRODUCT_ID/submissions/operations/$SUBMISSION_ID")

	STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.status')

	if [ "$STATUS" = "Succeeded" ]; then
		echo -e "${COLOR_SUCCESS}Submission completed successfully.${COLOR_RESET}"
		break
	elif [ "$STATUS" = "Failed" ]; then
		REASON=$(echo "$STATUS_RESPONSE" | jq -r '.message')
		echo -e "${COLOR_ERROR}Submission failed.${COLOR_RESET}"
		echo -e "${COLOR_ERROR}Reason: $REASON${COLOR_RESET}"
		if [ "$REASON" = "Can't publish extension as your extension submission is in progress. Please try again later." ]; then
			exit 0
		fi
		exit 1
	else
		echo -e "${COLOR_LOG}Submission in progress. Status: $STATUS. Waiting...${COLOR_RESET}"
		sleep 30
	fi
done

echo -e "${COLOR_SUCCESS}Process completed successfully.${COLOR_RESET}"
