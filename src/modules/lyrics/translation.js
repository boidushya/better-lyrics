BetterLyrics.Translation = {
  translateText: function (text, targetLanguage) {
    let url = BetterLyrics.Constants.TRANSLATE_LYRICS_URL(targetLanguage, text);

    return fetch(url)
      .then(response => response.json())
      .then(data => {
        let originalLanguage = data[2];
        let translatedText = "";
        data[0].forEach(part => {
          translatedText += part[0];
        });
        return { originalLanguage, translatedText };
      })
      .catch(error => {
        BetterLyrics.Utils.log(BetterLyrics.Constants.TRANSLATION_ERROR_LOG, error);
        return null;
      });
  },

  onTranslationEnabled: function () {
    BetterLyrics.Storage.getStorage(["isTranslateEnabled", "translationLanguage"], items => {
      if (items.isTranslateEnabled) {
        callback(items);
      }
    });
  },
  getApi : async function(callback){
    await BetterLyrics.Storage.getStorage("apiValue", items => {
      callback(items);
    });
  },
  translateTextUsingGPT: async function (lyrics, targetLanguage, apiKey) {
    const url = 'https://api.openai.com/v1/chat/completions';
  
    const lyricsText = lyrics.map(line => line.words).join('\n');
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: `Translate the following lyrics into ${targetLanguage}, maintaining the structure and keeping each line separate with a newline character (\\n) after every line:\n\n${lyricsText}`
            }
          ]
        })
      });
      const data = await response.json();
      const translatedText = data.choices[0].message.content.trim();
  
      const translatedLines = translatedText.split('\n');
  
      const translatedLyrics = lyrics.map((line, index) => ({
        ...line,
        translatedLines: translatedLines[index] || line.words
      }));
  
      return translatedLyrics;
    } catch (error) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.TRANSLATION_ERROR_LOG, error);
      return null;
    }
  },  
};