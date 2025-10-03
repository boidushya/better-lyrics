// Function to save user options

import {browser} from "../../extension.config";


const saveOptions = () => {
  const options = getOptionsFromForm();

  function arrayEqual(a, b) {
    return (
      Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((element, index) => element === b[index])
    );
  }

  chrome.storage.sync.get({preferredProviderList: null}, currentOptions => {
    if (!arrayEqual(currentOptions.preferredProviderList, options.preferredProviderList)) {
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
  const preferredProviderList = [];
  const providerElems = document.getElementById("providers-list").children;
  for (let i = 0; i < providerElems.length; i++) {
    let id = providerElems[i].id.slice(2);
    if (!providerElems[i].children[1].children[0].checked) {
      id = "d_" + id;
    }
    preferredProviderList.push(id);
  }

  return {
    isLogsEnabled: document.getElementById("logs").checked,
    isAutoSwitchEnabled: document.getElementById("autoSwitch").checked,
    isAlbumArtEnabled: document.getElementById("albumArt").checked,
    isFullScreenDisabled: document.getElementById("isFullScreenDisabled").checked,
    isStylizedAnimationsEnabled: document.getElementById("isStylizedAnimationsEnabled").checked,
    isTranslateEnabled: document.getElementById("translate").checked,
    translationLanguage: document.getElementById("translationLanguage").value,
    isCursorAutoHideEnabled: document.getElementById("cursorAutoHide").checked,
    isRomanizationEnabled: document.getElementById("isRomanizationEnabled").checked,
    preferredProviderList: preferredProviderList,
  };
};

// Function to save options to Chrome storage
const saveOptionsToStorage = options => {
  chrome.storage.sync.set(options, () => {
    chrome.tabs.query({url: "https://music.youtube.com/*"}, tabs => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {action: "updateSettings", settings: options});
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
  chrome.tabs.query({url: "https://music.youtube.com/*"}, tabs => {
    if (tabs.length === 0) {
      updateCacheInfo();
      showAlert("Cache cleared successfully!");
      if (callback && typeof callback === "function") callback();
      return;
    }

    let completedTabs = 0;
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {action: "clearCache"}, response => {
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

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

// Function to subscribe to cache info updates
const subscribeToCacheInfo = () => {
  chrome.storage.sync.get("cacheInfo", items => {
    updateCacheInfo(items);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.cacheInfo) {
      updateCacheInfo({cacheInfo: changes.cacheInfo.newValue});
    }
  });
};

// Function to update cache info
const updateCacheInfo = items => {
  if (!items) {
    showAlert("Nothing to clear!");
    return;
  }
  const cacheInfo = items.cacheInfo || {count: 0, size: 0};
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
    isTranslateEnabled: false,
    translationLanguage: "en",
    isRomanizationEnabled: false,
    preferredProviderList: [
      "musixmatch-richsync",
      "yt-captions",
      "lrclib-synced",
      "musixmatch-synced",
      "bLyrics",
      "yt-lyrics",
      "lrclib-plain",
    ],
  };

  chrome.storage.sync.get(defaultOptions, setOptionsInForm);

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
  document.getElementById("translate").checked = items.isTranslateEnabled;
  document.getElementById("translationLanguage").value = items.translationLanguage;
  document.getElementById("isRomanizationEnabled").checked = items.isRomanizationEnabled;

  const providersListElem = document.getElementById("providers-list");
  providersListElem.innerHTML = "";

  // Always recreate in the default order to make sure no items go missing
  let unseenProviders = [
    "musixmatch-richsync",
    "yt-captions",
    "lrclib-synced",
    "musixmatch-synced",
    "bLyrics",
    "yt-lyrics",
    "lrclib-plain",
  ];

  for (let i = 0; i < items.preferredProviderList.length; i++) {
    const providerId = items.preferredProviderList[i];

    const disabled = providerId.startsWith("d_");
    const rawProviderId = disabled ? providerId.slice(2) : providerId;
    const providerElem = createProviderElem(rawProviderId, !disabled);

    if (providerElem === null) continue;
    providersListElem.appendChild(providerElem);
    unseenProviders = unseenProviders.filter(p => p !== rawProviderId);
  }

  unseenProviders.forEach(p => {
    const providerElem = createProviderElem(p);
    if (providerElem === null) return;
    providersListElem.appendChild(providerElem);
  });
};
const providerIdToNameMap = {
  "musixmatch-richsync": "Musixmatch (Word Synced)",
  "musixmatch-synced": "Musixmatch (Line Synced)",
  "yt-captions": "Youtube Captions (Line Synced)",
  "lrclib-synced": "LRClib (Line Synced)",
  bLyrics: "Better Lyrics (Line Synced)",
  "yt-lyrics": "Youtube (Unsynced)",
  "lrclib-plain": "LRClib (Unsynced)",
};

function createProviderElem(providerId, checked = true) {
  if (!Object.hasOwn(providerIdToNameMap, providerId)) {
    console.warn("Unknown provider ID:", providerId);
    return null;
  }

  const liElem = document.createElement("li");
  liElem.classList.add("sortable-item");
  liElem.id = "p-" + providerId;

  const handleElem = document.createElement("span");
  handleElem.classList.add("sortable-handle");
  liElem.appendChild(handleElem);

  const labelElem = document.createElement("label");
  labelElem.classList.add("checkbox-container");

  const checkboxElem = document.createElement("input");
  checkboxElem.classList.add("provider-checkbox");
  checkboxElem.type = "checkbox";
  checkboxElem.checked = checked;
  checkboxElem.id = "p-" + providerId + "-checkbox";
  labelElem.appendChild(checkboxElem);

  const checkmarkElem = document.createElement("span");
  checkmarkElem.classList.add("checkmark");
  labelElem.appendChild(checkmarkElem);
  const textElem = document.createElement("span");
  textElem.classList.add("provider-name");
  textElem.textContent = providerIdToNameMap[providerId];
  labelElem.appendChild(textElem);

  liElem.appendChild(labelElem);

  const styleFromCheckState = () => {
    if (checkboxElem.checked) {
      labelElem.classList.remove("disabled-item");
    } else {
      labelElem.classList.add("disabled-item");
    }
  };

  checkboxElem.addEventListener("change", () => {
    styleFromCheckState();
    saveOptions();
  });

  styleFromCheckState();

  return liElem;
}

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
