import * as Constants from "../../core/constants";
import * as Utils from "../../core/utils";
import * as Storage from "../../core/storage";

let cache = {
    romanization: new Map(),
    translation: new Map(),
};

export async function translateText(text, targetLanguage) {
  let url = Constants.TRANSLATE_IN_ROMAJI(targetLanguage, text);

  const cacheKey = `${targetLanguage}_${text}`;
  if (cache.translation.has(cacheKey)) {
    return cache.translation.get(cacheKey);
  }
  return fetch(url, {
    cache: "force-cache",
  }).then(response => response.json())
    .then(data => {
      let originalLanguage = data[2];
      let translatedText = "";
      data[0].forEach(part => {
        translatedText += part[0];
      });
      if (text.trim().toLowerCase() === translatedText.trim().toLowerCase() && text.trim() !== "") {
          return null;
        } else {
        const result = {originalLanguage, translatedText};
        cache.translation.set(cacheKey, result);
          return result;
        }
    })
    .catch(error => {
      Utils.log(Constants.TRANSLATION_ERROR_LOG, error);
      return null;
    });
}

export async function translateTextIntoRomaji(lang, text) {
  const cacheKey = text;
  if (cache.romanization.has(cacheKey)) {
    return cache.romanization.get(cacheKey);
    }

  let url = Constants.TRANSLATE_IN_ROMAJI(lang, text);
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
        cache.romanization.set(cacheKey, romanizedText);
        return romanizedText;
      }
    })
    .catch(error => {
      Utils.log(Constants.TRANSLATION_ERROR_LOG, error);
      return null;
    });
}

export async function onRomanizationEnabled(callback) {
  Storage.getStorage(["isRomanizationEnabled"], async items => {
    if (items.isRomanizationEnabled) {
      callback(items);
    }
  });
}

export function onTranslationEnabled(callback) {
  Storage.getStorage(["isTranslateEnabled", "translationLanguage"], items => {
    if (items.isTranslateEnabled) {
      this.currentTranslationLanguage = items.translationLanguage || "en";
      callback(items);
    }
  });
}

export function clearCache() {
  cache.romanization.clear();
  cache.translation.clear();
}

export function getTranslationFromCache(text, targetLanguage) {
  const cacheKey = `${targetLanguage}_${text}`;
  return cache.translation.get(cacheKey) || null;
}

export function getRomanizationFromCache(text) {
    const cacheKey = text;
  return cache.romanization.get(cacheKey) || null;
}

export let currentTranslationLanguage = "en";

