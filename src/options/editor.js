let saveTimeout;
let editor;
let currentThemeName = null;
let isUserTyping = false;
const SAVE_DEBOUNCE_DELAY = 1000;
const VALID_CHANGE_ORIGINS = ["undo", "redo", "cut", "paste", "drag", "+delete", "+input"];

import THEMES from "./themes.js";

const invalidKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Shift", "Enter", "Tab"];

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

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
  const options = document.getElementById("options");

  editCSS.style.display = "block";
  options.style.display = "none";
};

document.getElementById("edit-css-btn").addEventListener("click", openEditCSS);

const openOptions = () => {
  const editCSS = document.getElementById("css");
  const options = document.getElementById("options");

  editCSS.style.display = "none";
  options.style.display = "block";
};

document.getElementById("back-btn").addEventListener("click", openOptions);

document.addEventListener("DOMContentLoaded", function () {
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

  function saveToStorage(isTheme = false) {
    const css = editor.getValue();

    if (!isTheme && isUserTyping) {
      // Only remove theme selection if it's not a theme save and the user is typing
      browserAPI.storage.sync.remove("themeName");
      themeSelector.value = "";
      currentThemeName = null;
    }

    browserAPI.storage.sync
      .set({ customCSS: css })
      .then(() => {
        syncIndicator.innerText = "Saved!";
        syncIndicator.classList.add("success");
        setTimeout(() => {
          syncIndicator.style.display = "none";
          syncIndicator.innerText = "Saving...";
          syncIndicator.classList.remove("success");
        }, 1000);

        // Send message to all tabs to update CSS
        try {
          browserAPI.runtime.sendMessage({ action: "updateCSS", css: css }).catch(error => {
            console.log("[BetterLyrics] (Safe to ignore) Error sending message:", error);
          });
        } catch (err) {
          console.log(err);
        }
      })
      .catch(() => {
        syncIndicator.innerText = "Something went wrong!";
        syncIndicator.classList.add("error");
        setTimeout(() => {
          syncIndicator.style.display = "none";
          syncIndicator.innerText = "Saving...";
          syncIndicator.classList.remove("error");
        }, 1000);
      });

    isUserTyping = false;
  }

  function debounceSave() {
    syncIndicator.style.display = "block";
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveToStorage, SAVE_DEBOUNCE_DELAY);
  }

  editor.on("change", function (_, changeObj) {
    console.log("cm", changeObj);
    if (VALID_CHANGE_ORIGINS.includes(changeObj.origin)) {
      isUserTyping = true;
      if (currentThemeName !== null) {
        themeSelector.value = "";
        currentThemeName = null;
        browserAPI.storage.sync.remove("themeName");
      }
      debounceSave(); //should be inside VALID_CHANGE_ORIGINS, or it would be called by editor.setText()
    }
  });

  // Load saved content
  browserAPI.storage.sync.get("customCSS", function (data) {
    if (data.customCSS) {
      editor.setValue(data.customCSS);
    }
  });

  editor.on("keydown", function (cm, event) {
    const isInvalidKey = invalidKeys.includes(event.key);
    if (!cm.state.completionActive && !isInvalidKey) {
      cm.showHint({ completeSingle: false });
    }
  });

  // Load themes
  THEMES.forEach((theme, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${theme.name} by ${theme.author}`;
    themeSelector.appendChild(option);
  });

  browserAPI.storage.sync.get(["themeName", "customCSS"], function (data) {
    if (data.themeName) {
      const themeIndex = THEMES.findIndex(theme => theme.name === data.themeName);
      if (themeIndex !== -1) {
        themeSelector.value = themeIndex;
        currentThemeName = data.themeName;
      }
    }
    if (data.customCSS) {
      editor.setValue(data.customCSS);
    }
  });

  // Handle theme selection
  themeSelector.addEventListener("change", function () {
    const selectedTheme = THEMES[this.value];
    if (this.value === "") {
      editor.setValue("");
      saveToStorage();
      browserAPI.storage.sync.remove("themeName");
      currentThemeName = null;
      showAlert("Cleared theme");
      return;
    }

    if (selectedTheme) {
      let themeContent = `/* ${selectedTheme.name}, a theme for BetterLyrics by ${selectedTheme.author} ${selectedTheme.link && `(${selectedTheme.link})`} */

${selectedTheme.css}
`;
      editor.setValue(themeContent); //fires editor.on("change");

      browserAPI.storage.sync.set({ themeName: selectedTheme.name });
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
  browserAPI.permissions.contains({ permissions: ["downloads"] }, hasPermission => {
    if (hasPermission) {
      downloadFile(css, defaultFilename);
    } else {
      browserAPI.permissions.request({ permissions: ["downloads"] }, granted => {
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
  const blob = new Blob([css], { type: "text/css" });
  const url = URL.createObjectURL(blob);

  if (browserAPI.downloads) {
    browserAPI.downloads
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
  const blob = new Blob([css], { type: "text/css" });
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
        editor.setValue(css); //fires editor.on("change");
        showAlert(`CSS file "${file.name}" imported!`);
      })
      .catch(() => {
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
