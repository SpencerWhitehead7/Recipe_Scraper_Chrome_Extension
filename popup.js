// Populate textbox
const populate = recipeStr => {
  console.log(`POPULATE HIT`, recipeStr)
  document.getElementById(`recipeStr`).innerHTML = recipeStr
}

window.addEventListener(`DOMContentLoaded`, () => {
  chrome.tabs.query({active : true, currentWindow : true}, tabs => {
    console.log(`DOMCONTENTLOADED FIRED`, tabs)
    chrome.tabs.sendMessage(tabs[0].id, {getRecipeStr : true}, res => {console.log(`GOT RES`, res)})
  })
})