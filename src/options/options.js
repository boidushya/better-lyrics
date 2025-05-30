// Function to save user options

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

const saveOptions = () => {
  const options = getOptionsFromForm();

  function arrayEqual(a, b) {
    return (
      Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((element, index) => element === b[index])
    );
  }

  browserAPI.storage.sync.get({ preferredProviderList: null, shouldUseKaraokeLyrics: false }, currentOptions => {
    if (
      !arrayEqual(currentOptions.preferredProviderList, options.preferredProviderList) ||
      currentOptions.shouldUseKaraokeLyrics !== options.shouldUseKaraokeLyrics
    ) {
      clearTransientLyrics(() => {
        saveOptionsToStorage(options);
      });
    } else {
      saveOptionsToStorage(options);
    }
  });
};

// Function to get options from form elements
const getOptionsFromForm = () => {
  let preferredProviderList = [];
  let providerElems = document.getElementById("providers-list").children;
  for (let i = 0; i < providerElems.length; i++) {
    preferredProviderList.push(providerElems[i].id);
  }

  return {
    isLogsEnabled: document.getElementById("logs").checked,
    isAutoSwitchEnabled: document.getElementById("autoSwitch").checked,
    isAlbumArtEnabled: document.getElementById("albumArt").checked,
    isFullScreenDisabled: document.getElementById("isFullScreenDisabled").checked,
    isStylizedAnimationsEnabled: document.getElementById("isStylizedAnimationsEnabled").checked,
    shouldUseKaraokeLyrics: document.getElementById("shouldUseKaraokeLyrics").checked,
    isTranslateEnabled: document.getElementById("translate").checked,
    translationLanguage: document.getElementById("translationLanguage").value,
    isCursorAutoHideEnabled: document.getElementById("cursorAutoHide").checked,
    isRomanizationEnabled: document.getElementById("isRomanizationEnabled").checked,
    preferredProviderList: preferredProviderList,
  };
};

// Function to save options to Chrome storage
const saveOptionsToStorage = options => {
  browserAPI.storage.sync.set(options, () => {
    browserAPI.tabs.query({ url: "https://music.youtube.com/*" }, function (tabs) {
      tabs.forEach(tab => {
        browserAPI.tabs.sendMessage(tab.id, { action: "updateSettings", settings: options });
      });
    });
  });
};

// Function to show save confirmation message
const _showSaveConfirmation = () => {
  const status = document.getElementById("status");
  status.textContent = "Options saved. Refresh tab to apply changes.";
  status.classList.add("active");
  setTimeout(hideSaveConfirmation, 4000);
};

// Function to hide save confirmation message
const hideSaveConfirmation = () => {
  const status = document.getElementById("status");
  status.classList.remove("active");
  setTimeout(() => {
    status.textContent = "";
  }, 200);
};

// Function to show alert message
const showAlert = message => {
  const status = document.getElementById("status");
  status.innerText = message;
  status.classList.add("active");

  setTimeout(() => {
    status.classList.remove("active");
    setTimeout(() => {
      status.innerText = "";
    }, 200);
  }, 2000);
};

// Function to clear transient lyrics
const clearTransientLyrics = callback => {
  browserAPI.tabs.query({ url: "https://music.youtube.com/*" }, function (tabs) {
    if (tabs.length === 0) {
      updateCacheInfo();
      showAlert("Cache cleared successfully!");
      if (callback && typeof callback === "function") callback();
      return;
    }

    let completedTabs = 0;
    tabs.forEach(tab => {
      browserAPI.tabs.sendMessage(tab.id, { action: "clearCache" }, response => {
        completedTabs++;
        if (completedTabs === tabs.length) {
          if (response?.success) {
            updateCacheInfo();
            showAlert("Cache cleared successfully!");
          } else {
            showAlert("Failed to clear cache!");
          }
          if (callback && typeof callback === "function") callback();
        }
      });
    });
  });
};

const _formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Function to subscribe to cache info updates
const subscribeToCacheInfo = () => {
  browserAPI.storage.sync.get("cacheInfo", items => {
    updateCacheInfo(items);
  });

  browserAPI.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.cacheInfo) {
      updateCacheInfo({ cacheInfo: changes.cacheInfo.newValue });
    }
  });
};

// Function to update cache info
const updateCacheInfo = items => {
  if (!items) {
    showAlert("Nothing to clear!");
    return;
  }
  const cacheInfo = items.cacheInfo || { count: 0, size: 0 };
  const cacheCount = document.getElementById("lyrics-count");
  const cacheSize = document.getElementById("cache-size");

  cacheCount.textContent = cacheInfo.count;
  cacheSize.textContent = _formatBytes(cacheInfo.size);
};

// Function to restore user options
const restoreOptions = () => {
  subscribeToCacheInfo();

  const defaultOptions = {
    isLogsEnabled: true,
    isAutoSwitchEnabled: false,
    isAlbumArtEnabled: true,
    isCursorAutoHideEnabled: true,
    isFullScreenDisabled: false,
    isStylizedAnimationsEnabled: true,
    shouldUseKaraokeLyrics: false,
    isTranslateEnabled: false,
    translationLanguage: "en",
    isRomanizationEnabled: false,
    preferredProviderList: ["p-dacubeking", "p-better-lyrics", "p-lrclib", "p-yt-captions"],
  };

  browserAPI.storage.sync.get(defaultOptions, setOptionsInForm);

  document.getElementById("clear-cache").addEventListener("click", clearTransientLyrics);
};

// Function to set options in form elements
const setOptionsInForm = items => {
  document.getElementById("logs").checked = items.isLogsEnabled;
  document.getElementById("albumArt").checked = items.isAlbumArtEnabled;
  document.getElementById("autoSwitch").checked = items.isAutoSwitchEnabled;
  document.getElementById("cursorAutoHide").checked = items.isCursorAutoHideEnabled;
  document.getElementById("isFullScreenDisabled").checked = items.isFullScreenDisabled;
  document.getElementById("isStylizedAnimationsEnabled").checked = items.isStylizedAnimationsEnabled;
  document.getElementById("shouldUseKaraokeLyrics").checked = items.shouldUseKaraokeLyrics;
  document.getElementById("translate").checked = items.isTranslateEnabled;
  document.getElementById("translationLanguage").value = items.translationLanguage;
  document.getElementById("isRomanizationEnabled").checked = items.isRomanizationEnabled;

  let providersListElem = document.getElementById("providers-list");
  for (let i = 0; i < items.preferredProviderList.length; i++) {
    let providerElem = document.getElementById(items.preferredProviderList[i]);
    providerElem.remove();
    providersListElem.appendChild(providerElem);
  }
};

// Event listeners
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelectorAll("#options input, #options select").forEach(element => {
  element.addEventListener("change", saveOptions);
});

// Tab switcher
const tabButtons = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    tabButtons.forEach(btn => btn.classList.remove("active"));
    tabContents.forEach(content => content.classList.remove("active"));

    button.classList.add("active");
    document.querySelector(button.getAttribute("data-target")).classList.add("active");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  new Sortable(document.getElementById("providers-list"), {
    animation: 150,
    ghostClass: "dragging",
    onUpdate: saveOptions,
  });
});
