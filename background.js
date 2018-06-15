// Show/grey out button depending on whether site is supported

const show = (tabId, changeInfo, tab) => {
  chrome.tabs.query({active : true, currentWindow : true}, tabs => {
    if(tabs[0].url.includes(`allrecipes.com`)){ // ADD THEM FOR ALL THE OTHER SUPPORTED SITES
      chrome.pageAction.show(tabId)
    }
  })
}

chrome.tabs.onUpdated.addListener(show)

// Send URL to scraping logic so it knows which parser to use, spawn popup on response

/* eslint-disable no-var */
window.recipeStr = ``
/* eslint-enable no-var */

chrome.pageAction.onClicked.addListener(() => {
  chrome.tabs.query({active : true, currentWindow : true}, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, {tab : tabs[0]}, res => {
      chrome.windows.create({
        url : `popup.html`,
        type : `popup`,
        height : 864,
      })
      console.log(`RES TO BACKGROUND`, res)
      window.recipeStr = res
    })
  })
})