// Show/grey out button depending on whether site is supported

/* eslint-disable complexity */ // Ignores "massively" complex tabs clause
const show = (tabId, changeInfo, tab) => {
  chrome.tabs.query({active : true, currentWindow : true}, tabs => {
    if(tabs[0].url.includes(
      `allrecipes.com` ||
      `bettycrocker.com` ||
      `boneappetit.com` ||
      `chowhound.com` ||
      `cookinglight.com` ||
      `eatingwell.com` ||
      `epicurious.com` ||
      `food52.com` ||
      `foodandwine.com` ||
      `foodnetwork.com` ||
      `geniuskitchen.com` ||
      `jamieoliver.com` ||
      `myrecipes.com` ||
      `seriouseats.com` ||
      `simplyrecipes.com` ||
      `thekitchn.com`
    )){
      chrome.pageAction.show(tabId)
    }
  })
}
/* eslint-enable complexity */

chrome.tabs.onUpdated.addListener(show)

// Send URL to scraping logic, spawn popup on response and make recipeData available to popup.js

chrome.pageAction.onClicked.addListener(() => {
  chrome.tabs.query({active : true, currentWindow : true}, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, {tab : tabs[0]}, recipeData => {
      chrome.windows.create({
        url : `popup.html`,
        type : `popup`,
        height : 864,
      })
      console.log(`RES TO BACKGROUND`, recipeData)
      window.recipeData = recipeData
    })
  })
})