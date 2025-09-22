BetterLyrics.Translation = {
  cache: {
    romanization: new Map(),
    translation: new Map(),
  },
  translateText: async function (text, targetLanguage) {
    const cacheKey = `${targetLanguage}_${text}`;
    if (this.cache.translation.has(cacheKey)) {
      return this.cache.translation.get(cacheKey);
    }

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
        if (text.trim().toLowerCase() === translatedText.trim().toLowerCase() && text.trim() !== "") {
          return null;
        } else {
          const result = { originalLanguage, translatedText };
          this.cache.translation.set(cacheKey, result);
          return result;
        }
      })
      .catch(error => {
        BetterLyrics.Utils.log(BetterLyrics.Constants.TRANSLATION_ERROR_LOG, error);
        return null;
      });
  },
  translateTextIntoRomaji: async function (lang, text) {
    const cacheKey = text;
    if (this.cache.romanization.has(cacheKey)) {
      return this.cache.romanization.get(cacheKey);
    }

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
        if (text.trim().toLowerCase() === romanizedText.trim().toLowerCase() && text.trim() !== "") {
          return null;
        } else {
          this.cache.romanization.set(cacheKey, romanizedText);
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
        this.currentTranslationLanguage = items.translationLanguage || "en";
        callback(items);
      }
    });
  },
  clearCache: function () {
    this.cache.romanization.clear();
    this.cache.translation.clear();
  },
  getTranslationFromCache: function (text, targetLanguage) {
    const cacheKey = `${targetLanguage}_${text}`;
    return this.cache.translation.get(cacheKey) || null;
  },
  getRomanizationFromCache: function (text) {
    const cacheKey = text;
    return this.cache.romanization.get(cacheKey) || null;
  },
  currentTranslationLanguage: "en",
};
