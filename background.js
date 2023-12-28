chrome.runtime.onMessage.addListener(function (message, sender, senderResponse) {
  if (message.type === "image") {
    fetch('<https://api.tinify.com/shrink>', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa('api:xxxxxx')}`,
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({source: {url: message.url}})
    }).then(res => {
      return res.json();
    }).then(res => {
      senderResponse(res);
    })
  }
  return true
});