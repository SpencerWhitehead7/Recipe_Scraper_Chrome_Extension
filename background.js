/* global chrome:false */

// Show/grey out browser button depending on whether site is supported
const show = (tabId, changeInfo, tab) => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (
      tabs[0].url.includes(`allrecipes.com`) ||
      tabs[0].url.includes(`bettycrocker.com`) ||
      tabs[0].url.includes(`bonappetit.com`) ||
      tabs[0].url.includes(`chowhound.com`) ||
      tabs[0].url.includes(`cookinglight.com`) ||
      tabs[0].url.includes(`eatingwell.com`) ||
      tabs[0].url.includes(`epicurious.com`) ||
      tabs[0].url.includes(`food.com`) ||
      tabs[0].url.includes(`food52.com`) ||
      tabs[0].url.includes(`foodandwine.com`) ||
      tabs[0].url.includes(`foodnetwork.com`) ||
      tabs[0].url.includes(`jamieoliver.com`) ||
      tabs[0].url.includes(`myrecipes.com`) ||
      tabs[0].url.includes(`seriouseats.com`) ||
      tabs[0].url.includes(`simplyrecipes.com`) ||
      tabs[0].url.includes(`thekitchn.com`)
    ) {
      chrome.pageAction.show(tabId)
    }
  })
}

chrome.tabs.onUpdated.addListener(show)

// Send URL to scraping logic, spawn popup on response and make recipeData available to popup.js
chrome.pageAction.onClicked.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { tab: tabs[0] }, recipeData => {
      chrome.windows.create({
        url: `popup.html`,
        type: `popup`,
        width: 600,
        height: 800,
      })
      window.recipeData = recipeData
    })
  })
})
