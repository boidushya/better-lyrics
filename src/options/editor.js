import {browser} from "../../extension.config";

let saveTimeout;
let editor;
let currentThemeName = null;
let isUserTyping = false;
const SAVE_DEBOUNCE_DELAY = 1000;
const VALID_CHANGE_ORIGINS = ["undo", "redo", "cut", "paste", "drag", "+delete", "+input", "setValue"];

// Storage quota limits (in bytes)
const SYNC_STORAGE_LIMIT = 7000; // Leave some buffer under 8KB limit
const MAX_RETRY_ATTEMPTS = 3;

import THEMES from "./themes.js";

const invalidKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Shift", "Enter", "Tab"];

const showAlert = message => {
  const status = document.getElementById("status-css");
  status.innerText = message;
  status.classList.add("active");

  setTimeout(() => {
    status.classList.remove("active");
    setTimeout(() => {
      status.innerText = "";
    }, 200);
  }, 2000);
};

const openEditCSS = () => {
  const editCSS = document.getElementById("css");
  const options = document.getElementById("themes-content");

  editCSS.style.display = "block";
  options.style.display = "none";
};

document.getElementById("edit-css-btn").addEventListener("click", openEditCSS);

const openOptions = () => {
  const editCSS = document.getElementById("css");
  const options = document.getElementById("themes-content");

  editCSS.style.display = "none";
  options.style.display = "block";
};

document.getElementById("back-btn").addEventListener("click", openOptions);

document.addEventListener("DOMContentLoaded", () => {
  const syncIndicator = document.getElementById("sync-indicator");
  const themeSelector = document.getElementById("theme-selector");

  // Initialize CodeMirror
  editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    lineWrapping: true,
    smartIndent: true,
    lineNumbers: true,
    foldGutter: true,
    autoCloseTags: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    autoRefresh: true,
    mode: "css",
    theme: "seti",
    extraKeys: {
      "Ctrl-Space": "autocomplete",
    },
  });

  editor.refresh();
  editor.setSize(null, 300);

  // Enhanced storage management
  const getStorageStrategy = css => {
    const cssSize = new Blob([css]).size;
    return cssSize > SYNC_STORAGE_LIMIT ? "local" : "sync";
  };

  const saveToStorageWithFallback = async (css, isTheme = false, retryCount = 0) => {
    try {
      const strategy = getStorageStrategy(css);

      if (strategy === "local") {
        // Use local storage for large content
        await chrome.storage.local.set({customCSS: css});
        // Clear any sync storage CSS to avoid conflicts
        await chrome.storage.sync.remove("customCSS");
        // Store a flag indicating we're using local storage
        await chrome.storage.sync.set({cssStorageType: "local"});
      } else {
        // Use sync storage for smaller content
        await chrome.storage.sync.set({customCSS: css, cssStorageType: "sync"});
        // Clear any local storage CSS to avoid conflicts
        await chrome.storage.local.remove("customCSS");
      }

      // Always handle theme name in sync storage (small data)
      if (!isTheme && isUserTyping) {
        await chrome.storage.sync.remove("themeName");
        themeSelector.value = "";
        currentThemeName = null;
      }

      return {success: true, strategy};
    } catch (error) {
      console.error("Storage save attempt failed:", error);

      if (error.message?.includes("quota") && retryCount < MAX_RETRY_ATTEMPTS) {
        // Quota exceeded, try with local storage
        try {
          await chrome.storage.local.set({customCSS: css});
          await chrome.storage.sync.remove("customCSS");
          await chrome.storage.sync.set({cssStorageType: "local"});
          return {success: true, strategy: "local", wasRetry: true};
        } catch (localError) {
          console.error("Local storage fallback failed:", localError);
          return {success: false, error: localError};
        }
      }

      return {success: false, error};
    }
  };

  function saveToStorage(isTheme = false) {
    const css = editor.getValue();

    if (!isTheme && isUserTyping) {
      // Only remove theme selection if it's not a theme save and the user is typing
      chrome.storage.sync.remove("themeName");
      themeSelector.value = "";
      currentThemeName = null;
    }

    saveToStorageWithFallback(css, isTheme)
      .then(result => {
        if (result.success) {
          syncIndicator.innerText =
            result.strategy === "local" ? (result.wasRetry ? "Saved (Large CSS - Local)" : "Saved (Local)") : "Saved!";
          syncIndicator.classList.add("success");

          setTimeout(() => {
            syncIndicator.style.display = "none";
            syncIndicator.innerText = "Saving...";
            syncIndicator.classList.remove("success");
          }, 1000);

          // Send message to all tabs to update CSS
          try {
            chrome.runtime
              .sendMessage({
                action: "updateCSS",
                css: css,
                storageType: result.strategy,
              })
              .catch(error => {
                console.log("[BetterLyrics] (Safe to ignore) Error sending message:", error);
              });
          } catch (err) {
            console.log(err);
          }
        } else {
          throw result.error;
        }
      })
      .catch(err => {
        console.error("Error saving to storage:", err);

        let errorMessage = "Something went wrong!";
        if (err.message?.includes("quota")) {
          errorMessage = "CSS too large for storage!";
        }

        syncIndicator.innerText = errorMessage;
        syncIndicator.classList.add("error");
        setTimeout(() => {
          syncIndicator.style.display = "none";
          syncIndicator.innerText = "Saving...";
          syncIndicator.classList.remove("error");
        }, 3000);
      });

    isUserTyping = false;
  }

  function debounceSave() {
    syncIndicator.style.display = "block";
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveToStorage, SAVE_DEBOUNCE_DELAY);
  }

  editor.on("change", (_, changeObj) => {
    console.log("cm", changeObj);
    if (VALID_CHANGE_ORIGINS.includes(changeObj.origin)) {
      isUserTyping = true;
      if (currentThemeName !== null) {
        themeSelector.value = "";
        currentThemeName = null;
        chrome.storage.sync.remove("themeName");
      }
      debounceSave(); //should be inside VALID_CHANGE_ORIGINS, or it would be called by editor.setText()
    }
  });

  // Enhanced loading function to check both storage types
  const loadCustomCSS = async () => {
    try {
      // First check which storage type was used
      const syncData = await chrome.storage.sync.get(["cssStorageType", "customCSS"]);

      if (syncData.cssStorageType === "local") {
        // Load from local storage
        const localData = await chrome.storage.local.get("customCSS");
        return localData.customCSS || "";
      } else {
        // Load from sync storage or fallback to sync if no type is set
        return syncData.customCSS || "";
      }
    } catch (error) {
      console.error("Error loading CSS:", error);
      // Fallback: try both storages
      try {
        const localData = await chrome.storage.local.get("customCSS");
        if (localData.customCSS) return localData.customCSS;

        const syncData = await chrome.storage.sync.get("customCSS");
        return syncData.customCSS || "";
      } catch (fallbackError) {
        console.error("Fallback loading failed:", fallbackError);
        return "";
      }
    }
  };

  // Load saved content with enhanced loading
  loadCustomCSS().then(css => {
    if (css) {
      editor.setValue(css);
    }
  });

  editor.on("keydown", (cm, event) => {
    const isInvalidKey = invalidKeys.includes(event.key);
    if (!cm.state.completionActive && !isInvalidKey) {
      cm.showHint({completeSingle: false});
    }
  });

  // Load themes
  THEMES.forEach((theme, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${theme.name} by ${theme.author}`;
    themeSelector.appendChild(option);
  });

  // Enhanced theme and CSS loading
  Promise.all([chrome.storage.sync.get(["themeName"]), loadCustomCSS()]).then(([syncData, css]) => {
    if (syncData.themeName) {
      const themeIndex = THEMES.findIndex(theme => theme.name === syncData.themeName);
      if (themeIndex !== -1) {
        themeSelector.value = themeIndex;
        currentThemeName = syncData.themeName;
      }
    }
    if (css) {
      editor.setValue(css);
    }
  });

  // Handle theme selection
  themeSelector.addEventListener("change", function () {
    const selectedTheme = THEMES[this.value];
    if (this.value === "") {
      editor.setValue("");
      saveToStorage();
      chrome.storage.sync.remove("themeName");
      currentThemeName = null;
      showAlert("Cleared theme");
      return;
    }

    if (selectedTheme) {
      const themeContent = `/* ${selectedTheme.name}, a theme for BetterLyrics by ${selectedTheme.author} ${selectedTheme.link && `(${selectedTheme.link})`} */

${selectedTheme.css}
`;
      editor.setValue(themeContent); //fires editor.on("change");

      chrome.storage.sync.set({themeName: selectedTheme.name});
      currentThemeName = selectedTheme.name;
      isUserTyping = false;
      saveToStorage(true);
      showAlert(`Applied theme: ${selectedTheme.name}`);
    }
  });
});

// Themes

const generateDefaultFilename = () => {
  const date = new Date();
  const timestamp = date.toISOString().replace(/[:.]/g, "-").slice(0, -5);
  return `blyrics-theme-${timestamp}.css`;
};

const saveCSSToFile = (css, defaultFilename) => {
  chrome.permissions.contains({permissions: ["downloads"]}, hasPermission => {
    if (hasPermission) {
      downloadFile(css, defaultFilename);
    } else {
      chrome.permissions.request({permissions: ["downloads"]}, granted => {
        if (granted) {
          downloadFile(css, defaultFilename);
        } else {
          fallbackSaveMethod(css, defaultFilename);
        }
      });
    }
  });
};

const downloadFile = (css, defaultFilename) => {
  const blob = new Blob([css], {type: "text/css"});
  const url = URL.createObjectURL(blob);

  if (chrome.downloads) {
    chrome.downloads
      .download({
        url: url,
        filename: defaultFilename,
        saveAs: true,
      })
      .then(() => {
        showAlert("CSS file save dialog opened. Choose where to save your file.");
        URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.log(error);
        showAlert("Error saving file. Please try again.");
        URL.revokeObjectURL(url);
      });
  } else {
    fallbackSaveMethod(css, defaultFilename);
  }
};

const fallbackSaveMethod = (css, defaultFilename) => {
  const blob = new Blob([css], {type: "text/css"});
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = defaultFilename;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 100);

  showAlert("CSS file download initiated. Check your downloads folder.");
};

const loadCSSFromFile = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      resolve(event.target.result);
    };
    reader.onerror = error => {
      reject(error);
    };
    reader.readAsText(file);
  });
};

document.getElementById("file-import-btn").addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".css";
  input.onchange = event => {
    const file = event.target.files[0];
    loadCSSFromFile(file)
      .then(css => {
        editor.setValue(css);
        showAlert(`CSS file "${file.name}" imported!`);
      })
      .catch(err => {
        console.error("Error reading CSS file:", err);
        showAlert("Error reading CSS file! Please try again.");
      });
  };
  input.click();
});

document.getElementById("file-export-btn").addEventListener("click", () => {
  const css = editor.getValue();
  if (!css) {
    showAlert("No styles to export!");
    return;
  }
  const defaultFilename = generateDefaultFilename();
  saveCSSToFile(css, defaultFilename);
});
