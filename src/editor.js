let saveTimeout;
let editor;
const SAVE_DEBOUNCE_DELAY = 1000;

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

document.getElementById("import-btn").addEventListener("click", () => {
  navigator.clipboard.readText().then(text => {
    try {
      const css = atob(text);
      editor.setValue(css); // Use CodeMirror's setValue method
      showAlert("Styles imported from clipboard!");
    } catch {
      showAlert("Invalid styles in clipboard! Please try again.");
    }
  });
});

document.getElementById("export-btn").addEventListener("click", () => {
  const css = editor.getValue(); // Use CodeMirror's getValue method
  if (!css) {
    showAlert("No styles to export!");
    return;
  }
  const base64 = btoa(css);
  navigator.clipboard.writeText(base64).then(() => {
    showAlert("Styles copied to clipboard!");
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const syncIndicator = document.getElementById("sync-indicator");

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

  editor.setSize(null, 250);

  function saveToStorage() {
    chrome.storage.sync
      .set({ customCSS: editor.getValue() })
      .then(() => {
        syncIndicator.innerText = "Saved!";
        syncIndicator.classList.add("success");
        setTimeout(() => {
          syncIndicator.style.display = "none";
          syncIndicator.innerText = "Saving...";
          syncIndicator.classList.remove("success");
        }, 1000);
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
  }

  function debounceSave() {
    syncIndicator.style.display = "block";
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveToStorage, SAVE_DEBOUNCE_DELAY);
  }

  editor.on("change", function () {
    debounceSave();
  });

  // Load saved content
  chrome.storage.sync.get("customCSS", function (data) {
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
});
