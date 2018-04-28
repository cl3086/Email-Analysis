console.log("Background script")

chrome.browserAction.onClicked.addListener(buttonClicked)

function buttonClicked(tab) {
    chrome.tabs.create({'url': 'index.html'})
}
