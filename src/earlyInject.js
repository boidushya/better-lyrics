const originalFetch = window.fetch;
window.fetch = async function (request, init) {
  if (
    request.url.includes("https://music.youtube.com/youtubei/v1/browse") ||
    request.url.includes("https://music.youtube.com/youtubei/v1/next")
  ) {
    let clonedRequest = request.clone();
    const response = await originalFetch(request, init);
    const clonedResponse = response.clone();

    Promise.all([clonedRequest.json(), clonedResponse.json()]).then(awaited => {
      const event = new CustomEvent("blyrics-send-response", {
        detail: {
          url: clonedResponse.url,
          requestJson: awaited[0],
          responseJson: awaited[1],
          status: clonedResponse.status,
          timestamp: Date.now(),
        },
      });
      document.dispatchEvent(event);
    });
    return response;
  } else {
    return originalFetch(request, init);
  }
};
