const saveOptions = () => {
  const isLogsEnabled = document.getElementById("logs").checked;

  chrome.storage.sync.set({ isLogsEnabled }, () => {
    // Update status to let user know options were saved.
    const status = document.getElementById("status");
    status.textContent = "Options saved.";
    status.classList.add("active");
    setTimeout(() => {
      status.classList.remove("active");
      setTimeout(() => {
        status.textContent = "";
      }, 200);
    }, 2000);
  });
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get({ isLogsEnabled: true }, (items) => {
    document.getElementById("logs").checked = items.isLogsEnabled;
  });
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
