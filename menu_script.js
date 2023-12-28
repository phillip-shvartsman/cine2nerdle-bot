const checkbox = document.getElementById('link_enable')
const link_enable_key = "link_enable"

 chrome.storage.local.get([link_enable_key]).then((result) => {
    console.log("Value currently is " + result.key);
    checkbox.checked = result.key
  });

checkbox.addEventListener('change', (event) => {
  if (event.currentTarget.checked) {
    chrome.storage.local.set({link_enable_key:true})
  } else {
    chrome.storage.local.set({link_enable_key:false})
  }
});