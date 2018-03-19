console.log("Background script")

chrome.browserAction.onClicked.addListener(buttonClicked)

function buttonClicked(tab) {
    console.log("Button clicked!")
    console.log(tab)
    console.log(chrome.runtime.id)
    let chromeID = chrome.runtime.id
    // chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    //     console.log(tabs)
    //     let activeTab = tabs[0]
    //     chrome.tabs.sendMessage(activeTab.id, {'message': 'clicked_browser_action'})
    // })
    chrome.tabs.create({'url': `chrome-extension://${chromeID}/index.html`})
}
