const originalFetch = window.fetch;
window.fetch = async function (request, init) {
  const urlString = typeof request === 'string' ? request : request.url;

  if (
    urlString.includes("https://music.youtube.com/youtubei/v1/browse") ||
    urlString.includes("https://music.youtube.com/youtubei/v1/next")
  ) {
    try {
      // Clone the request immediately if it's an object
      const requestToFetch = typeof request === 'string' ? request : request.clone();
      const originalRequestForJson = typeof request === 'string' ? new Request(request, init) : request.clone();

      const response = await originalFetch(requestToFetch, init);
      const clonedResponseForJson = response.clone();


      Promise.all([
        originalRequestForJson.text().catch(e => {
          console.error('Better Lyrics: Error reading request text:', e);
          return "{}";
        }),
        clonedResponseForJson.text().catch(e => {
          console.error('Better Lyrics: Error reading response text:', e);
          return "{}";
        })
      ]).then(awaitedTexts => {
        let requestJson, responseJson;
        try {
          requestJson = JSON.parse(awaitedTexts[0]);
        } catch (e) {
          console.error("Better Lyrics: Error parsing request JSON for URL:", urlString, e);
          requestJson = {error: "Failed to parse request JSON"};
        }
        try {
          responseJson = JSON.parse(awaitedTexts[1]);
        } catch (e) {
          console.error("Better Lyrics: Error parsing response JSON for URL:", clonedResponseForJson.url || urlString, e);
          responseJson = {error: "Failed to parse response JSON"};
        }

        const event = new CustomEvent("blyrics-send-response", {
          detail: {
            url: clonedResponseForJson.url || urlString,
            requestJson: requestJson,
            responseJson: responseJson,
            status: clonedResponseForJson.status,
            timestamp: Date.now(),
          },
        });
        document.dispatchEvent(event);
      }).catch(error => {
        console.error("Better Lyrics: Error in Promise.all processing:", error, clonedResponseForJson.url || urlString);
      });

      return response; // Return the original response fetched
    } catch (error) {
      console.error("Better Lyrics: Error in fetch wrapper for URL:", urlString, error);
      return originalFetch(request, init); // Fallback to original fetch on error
    }
  } else {
    return originalFetch(request, init);
  }
};