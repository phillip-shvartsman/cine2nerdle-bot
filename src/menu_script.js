const checkbox = document.getElementById("link_enable")
const input_box = document.getElementById("tmdb-api-key")
const link_enable_key = "link_enable"
const tmdb_api_key = "tmdb_api_key"

chrome.storage.local.get([link_enable_key]).then((result) =>
{
    console.log(result);
    if (result[link_enable_key] === "true")
    {
        checkbox.checked = true
    }
    else
    {
        checkbox.checked = false
    }
});
chrome.storage.local.get([tmdb_api_key]).then((result) =>
{
    console.log(result);
    if (result[tmdb_api_key] === undefined)
    {
        return
    }
    else
    {
        input_box.value = result[`${tmdb_api_key}`]
    }
});

checkbox.addEventListener("change", (event) =>
{
    let checked = event.currentTarget.checked
    if (checked === true)
    {
        let set = {}
        set[`${link_enable_key}`] = "true"
        chrome.storage.local.set(set).then(() =>
        {
            console.log(`${link_enable_key} set to true`);
        });
    }
    else
    {
        let set = {}
        set[`${link_enable_key}`] = "false"
        chrome.storage.local.set(set).then(() =>
        {
            console.log(`${link_enable_key} set to false`);
        });
    }
});

input_box.addEventListener("change", () =>
{
    let set = {}
    set[`${tmdb_api_key}`] = input_box.value
    chrome.storage.local.set(set).then(() =>
    {
        console.log(`${tmdb_api_key} set to ${input_box.value}`);
    });
});