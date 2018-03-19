console.log("Here!")

chrome.runtime.onMessage.addListener(gotMessage)

function gotMessage (request, sender, sendResponse) {
    if(request.message === 'clicked_browser_action') {
        console.log('here!')
        console.log(chrome.runtime.id)
    }
}
