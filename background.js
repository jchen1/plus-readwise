chrome.browserAction.onClicked.addListener((tab) => {
  chrome.tabs.executeScript(tab.id, { file: "bookmarklet.js" });
});

function getAccessToken(cookies) {
  const filtered = cookies.filter((c) => c.name === "accessToken");
  if (filtered.length === 0) {
    return null;
  }
  return filtered[0].value;
}

const AUTH_FAILED_MSG =
  "Authentication failed! Please log back in at <a href='https://readwise.io' target='_blank'>readwise.io</a>!";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { text, url, title } = message;

  // readwise sends accessToken in cookies & in the auth header, so we need to grab the cookie!
  chrome.cookies.getAll({ domain: "readwise.io" }, (cookies) => {
    const token = getAccessToken(cookies);

    if (!token) {
      return sendResponse({
        success: false,
        message: AUTH_FAILED_MSG,
      });
    }

    fetch("https://readwise.io/api/v2/highlights", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ highlights: [{ text, url, title }] }),
    }).then(
      (response) => {
        if (response.status < 400) {
          sendResponse({ success: true });
        } else if (response.status === 401 || response.status === 403) {
          sendResponse({
            success: false,
            message: AUTH_FAILED_MSG,
          });
        } else {
          sendResponse({
            success: false,
            message: "Failed to save to Readwise!",
          });
        }
      },
      (err) => {
        sendResponse({ success: false, message: err.message });
      }
    );
  });

  return true;
});

chrome.contextMenus.create({
  title: "Save to Readwise",
  id: "save",
  contexts: ["selection"],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.tabs.executeScript(tab.id, { file: "bookmarklet.js" });
});
