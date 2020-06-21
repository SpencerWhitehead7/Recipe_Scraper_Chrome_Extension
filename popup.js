/* global chrome:false */

window.addEventListener(`DOMContentLoaded`, () => {
  const textarea = document.getElementsByTagName(`textarea`)[0]
  const button = document.getElementsByTagName(`button`)[0]
  const input = document.getElementsByTagName(`input`)[0]

  // Download text as .txt file
  const download = () => {
    // Getting text into a downloadable format
    const text = textarea.innerHTML
    const textBlob = new Blob([text], { type: `text/plain` })
    const fileName = input.value

    // Triggering download
    const downloadLink = document.createElement(`a`)
    downloadLink.download = fileName
    downloadLink.href = window.URL.createObjectURL(textBlob)
    downloadLink.onclick = evt => { document.body.removeChild(evt.target) }
    downloadLink.style.display = `none`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    alert(`Saved to your default download location`)
  }

  // Populate textbox
  const populate = recipeData => {
    if (recipeData && recipeData.text === `Make sure your URL is at seriouseats.com/recipes, not just seriouseats.com`) {
      textarea.innerHTML = recipeData.text
      button.disabled = true
    } else if (recipeData && (!recipeData.title || !recipeData.text)) {
      textarea.innerHTML = `Error: failed to scrape\n\nMake sure you're on a specific recipe's page`
      button.disabled = true
    } else if (recipeData) {
      textarea.innerHTML = recipeData.text
      input.value = `${recipeData.sourceSite.slice(0, -4)} ${recipeData.title}`
      button.addEventListener(`click`, download)
    } else {
      button.disabled = true
    }
  }

  chrome.runtime.getBackgroundPage(background => { populate(background.recipeData) })
})
