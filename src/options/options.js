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

// Function to restore user options
const restoreOptions = () => {
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
