/* global chrome:false */

window.addEventListener(`DOMContentLoaded`, () => {
  // Constants
  const textarea = document.getElementsByTagName(`textarea`)[0]
  const button = document.getElementsByTagName(`button`)[0]
  const input = document.getElementsByTagName(`input`)[0]

  // Download text as .txt file
  const download = () => {
    // Getting text into a downloadable format
    const text = textarea.innerHTML
    const textAsBlob = new Blob([text], {type : `text/plain`})
    const fileNameToSaveAs = input.value

    // Triggering download
    const downloadLink = document.createElement(`a`)
    downloadLink.download = fileNameToSaveAs
    downloadLink.innerHTML = `Download Recipe`
    downloadLink.href = window.URL.createObjectURL(textAsBlob)
    downloadLink.onclick = event => {document.body.removeChild(event.target)}
    downloadLink.style.display = `none`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    /* eslint-disable no-alert */
    alert(`Saved to your default download location`)
    /* eslint-enable no-alert */
  }

  // Populate textbox
  const populate = recipeData => {
    if(recipeData && recipeData.recipe === `Make sure your URL is at seriouseats.com/recipes, not just seriouseats.com`){
      textarea.innerHTML = recipeData.recipe
      button.disabled = true
    }else if(recipeData && !recipeData.title){
      textarea.innerHTML = `Error: failed to scrape: invalid url\n\nMake sure you're using the url of a specific recipe`
      button.disabled = true
    }else if(recipeData){
      textarea.innerHTML = recipeData.recipe
      input.value = `${recipeData.sourceSite.slice(0, -4)} ${recipeData.title}`
      button.addEventListener(`click`, download)
    }else{
      button.disabled = true
    }
  }

  chrome.runtime.getBackgroundPage(background => {
    populate(background.recipeData)
  })
})
