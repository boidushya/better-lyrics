let saveTimeout;
const SAVE_DEBOUNCE_DELAY = 1000;

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
  // Paste from clipboard, parse base64 and set as value
  navigator.clipboard.readText().then(text => {
    try {
      const css = atob(text);
      document.getElementById("editor").value = css;
      document.getElementById("editor").dispatchEvent(new Event("input"));
      showAlert("Styles imported from clipboard!");
    } catch {
      showAlert("Invalid styles in clipboard! Please try again.");
    }
  });
});

document.getElementById("export-btn").addEventListener("click", () => {
  const css = document.getElementById("editor").value;
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
  const editor = document.getElementById("editor");
  const highlight = document.querySelector("#highlight code");
  const syncIndicator = document.getElementById("sync-indicator");

  function updateHighlighting() {
    const code = editor.value;
    highlight.innerHTML = highlightCSS(code);
    syncScroll();
  }

  function syncScroll() {
    highlight.parentElement.scrollTop = editor.scrollTop;
    highlight.parentElement.scrollLeft = editor.scrollLeft;
  }

  function toggleComment() {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const lines = editor.value.split("\n");
    const startLine = editor.value.substring(0, start).split("\n").length - 1;
    const endLine = editor.value.substring(0, end).split("\n").length - 1;

    const isCommented = lines[startLine].trim().startsWith("/*") && lines[startLine].trim().endsWith("*/");

    if (isCommented) {
      // Uncomment lines
      if (startLine === endLine) {
        lines[startLine] = lines[startLine].replace(/^\/\*\s*/, "").replace(/\s*\*\/$/, "");
      } else {
        lines[startLine] = lines[startLine].replace(/^\/\*\s*/, "");
        lines[endLine] = lines[endLine].replace(/\s*\*\/$/, "");
      }
    } else {
      // Comment lines
      if (startLine === endLine) {
        lines[startLine] = `/* ${lines[startLine]} */`;
      } else {
        lines[startLine] = `/* ${lines[startLine]}`;
        lines[endLine] = `${lines[endLine]} */`;
      }
    }

    editor.value = lines.join("\n");
    editor.setSelectionRange(start, end);
    updateHighlighting();
  }

  function saveToStorage() {
    chrome.storage.sync
      .set({ customCSS: editor.value })
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

  editor.addEventListener("input", function () {
    debounceSave();
    updateHighlighting();
  });

  // Load saved content
  chrome.storage.sync.get("customCSS", function (data) {
    if (data.customCSS) {
      editor.value = data.customCSS;
      updateHighlighting();
    }
  });

  editor.addEventListener("keydown", function (e) {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = this.selectionStart;
      const end = this.selectionEnd;
      this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
      this.selectionStart = this.selectionEnd = start + 4;
      updateHighlighting();
    } else if ((e.metaKey || e.ctrlKey) && e.key === "/") {
      e.preventDefault();
      toggleComment();
    }
  });

  editor.addEventListener("scroll", syncScroll);

  updateHighlighting();
});

const highlightCSS = code => {
  let escapedCode = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const tokenMap = [];
  let placeholderCount = 0;

  const addToken = (type, value) => {
    const placeholder = `__TOKEN_${placeholderCount}__`;
    tokenMap.push({ type, value, placeholder });
    placeholderCount++;
    return placeholder;
  };

  let highlightedCode = escapedCode
    .replace(/\/\*[\s\S]*?\*\//g, match => addToken("comment", match))
    .replace(/(["'])(?:\\.|[^\\])*?\1/g, match => addToken("string", match))
    .replace(/([^\{\s]+)(?=\s*\{)/g, match => addToken("selector", match))
    .replace(/([\w-]+)(?=\s*:)/g, match => addToken("property", match))
    .replace(/:\s*([^;\}\s]+(?:\s+[^\;\}\s]+)*)/g, match => addToken("value", match))
    .replace(/!important\b/gi, match => addToken("important", match))
    .replace(/[{}:;]/g, match => addToken("punctuation", match));

  tokenMap.forEach(({ type, value, placeholder }) => {
    highlightedCode = highlightedCode.replace(placeholder, `<span class="${type}">${value}</span>`);
  });

  return highlightedCode;
};
