BetterLyrics.Translation = {
  translateText: async function (text, targetLanguage) {
    let url = BetterLyrics.Constants.TRANSLATE_LYRICS_URL(targetLanguage, text);

    return fetch(url, {
      cache: "force-cache",
    })
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
  translateTextIntoRomaji: async function (lang, text) {
    let url = BetterLyrics.Constants.TRANSLATE_IN_ROMAJI(lang, text);
    return fetch(url, {
      cache: "force-cache",
    })
      .then(response => response.json())
      .then(data => {
        let romanizedText = data[0][1][3];
        if (romanizedText === undefined) {
          romanizedText = data[0][1][2];
        }
        if (text.trim().toLowerCase() === romanizedText.trim().toLowerCase()) {
          return null;
        } else {
          return romanizedText;
        }
      })
      .catch(error => {
        BetterLyrics.Utils.log(BetterLyrics.Constants.TRANSLATION_ERROR_LOG, error);
        return null;
      });
  },

  onRomanizationEnabled: function (callback) {
    BetterLyrics.Storage.getStorage(["isRomanizationEnabled"], async items => {
      if (items.isRomanizationEnabled) {
        callback(items);
      }
    });
  },

  onTranslationEnabled: function (callback) {
    BetterLyrics.Storage.getStorage(["isTranslateEnabled", "translationLanguage"], items => {
      if (items.isTranslateEnabled) {
        callback(items);
      }
    });
  },
};
