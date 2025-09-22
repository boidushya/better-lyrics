import * as Constants from "../../core/constants";
import * as Utils from "../../core/utils";

export async function translateText(text, targetLanguage) {
  let url = Constants.TRANSLATE_IN_ROMAJI(targetLanguage, text);

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      let originalLanguage = data[2];
      let translatedText = "";
      data[0].forEach(part => {
        translatedText += part[0];
      });
      return {originalLanguage, translatedText};
    })
    .catch(error => {
      Utils.log(Constants.TRANSLATION_ERROR_LOG, error);
      return null;
    });
}

export async function translateTextIntoRomaji(lang, text) {
  let url = Constants.TRANSLATE_IN_ROMAJI(lang, text);
  return fetch(url)
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
      Utils.log(Constants.TRANSLATION_ERROR_LOG, error);
      return null;
    });
}

export async function onRomanizationEnabled(callback, next = () => {
}) {
  Storage.getStorage(["isRomanizationEnabled"], async items => {
    if (items.isRomanizationEnabled) {
      await callback(items);
    }
    await next();
  });
}

export function onTranslationEnabled(callback) {
  Storage.getStorage(["isTranslateEnabled", "translationLanguage"], items => {
    if (items.isTranslateEnabled) {
      callback(items);
    }
  });
}

