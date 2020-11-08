(function () {
  const text = window.getSelection().toString();

  function popup(success, message) {
    const bgcolor = success ? "#3a9104" : "#a10705";
    const body = document.getElementsByTagName("body")[0];

    if (body) {
      const old = document.getElementById("plus-readwise-message");

      if (old) {
        body.removeChild(old);
      }

      const elem = document.createElement("div");
      elem.innerHTML = message || "Saved to Readwise!";
      elem.style = `z-index:2147483647;background-color:${bgcolor};color:white;font-size:14px;font-family:sans-serif;padding:5px 10px;position:fixed;top:0;left:50%;transform:translateX(-50%);width:fit-content;`;

      body.appendChild(elem);

      window.setTimeout(() => {
        body.removeChild(elem);
      }, 2000);
    }
  }

  if (text) {
    chrome.runtime.sendMessage(
      null,
      {
        text,
        url: window.location.href,
        title: window.title,
      },
      null,
      (response) => {
        if (!response) {
          return popup(false, "Failed to save to Readwise!");
        } else {
          return popup(response.success, response.message);
        }
      }
    );
  } else {
  }
})();
