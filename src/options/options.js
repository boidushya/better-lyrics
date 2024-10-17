// Function to save user options
const saveOptions = () => {
  const options = getOptionsFromForm();
  saveOptionsToStorage(options);
};

// Function to get options from form elements
const getOptionsFromForm = () => {
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
  };
};

// Function to save options to Chrome storage
const saveOptionsToStorage = options => {
  chrome.storage.sync.set(options, () => {
    chrome.tabs.query({ url: "https://music.youtube.com/*" }, function (tabs) {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: "updateSettings", settings: options });
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
const clearTransientLyrics = () => {
  chrome.storage.sync.get(null, items => {
    const keysToRemove = Object.keys(items).filter(key => items[key].type === "transient");

    if (keysToRemove.length > 0) {
      chrome.storage.sync.remove(keysToRemove, () => {
        console.log("All transient lyrics have been cleared.");
        showAlert("Lyrics cleared from cache!");
      });
    } else {
      console.log("No transient lyrics to clear.");
      showAlert("No lyrics to clear!");
    }
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

// Function to update cache info
const updateCacheInfo = () => {
  chrome.storage.sync.get(null, items => {
    const lyricsKeys = Object.keys(items).filter(key => items[key].type === "transient");

    document.getElementById("lyrics-count").textContent = lyricsKeys.length;

    let totalSize = 0;
    lyricsKeys.forEach(key => {
      const value = JSON.stringify(items[key]);
      totalSize += value.length;
    });

    document.getElementById("cache-size").textContent = _formatBytes(totalSize);
  });
  console.log("Cache info updated.");
};

// Function to restore user options
const restoreOptions = () => {
  updateCacheInfo();

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
  };

  chrome.storage.sync.get(defaultOptions, setOptionsInForm);

  document.getElementById("clear-cache").addEventListener("click", clearTransientLyrics);

  chrome.storage.onChanged.addListener((_, areaName) => {
    if (areaName === "sync") {
      updateCacheInfo();
    }
  });
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
