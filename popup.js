// Populate textbox
const populate = recipeData => {
  if(recipeData && recipeData.recipe === `Make sure your URL is at seriouseats.com/recipes, not just seriouseats.com`){
    document.getElementsByTagName(`textarea`)[0].innerHTML = recipeData.recipe
    document.getElementsByTagName(`button`)[0].disabled = true
  }else if(recipeData && recipeData.recipe.includes(`•`) && recipeData.recipe.includes(`1)`)){
    document.getElementsByTagName(`textarea`)[0].innerHTML = recipeData.recipe
    document.getElementsByTagName(`input`)[0].value = `${recipeData.source.slice(0, -4)} ${recipeData.title}`
    document.getElementsByTagName(`button`)[0].addEventListener(`click`, download)
  }else if(recipeData){
    document.getElementsByTagName(`textarea`)[0].innerHTML = `Error: failed to scrape: invalid url\n\nMake sure you're using the url of a specific recipe`
    document.getElementsByTagName(`button`)[0].disabled = true
  }else{
    document.getElementsByTagName(`button`)[0].disabled = true
  }
}

window.addEventListener(`DOMContentLoaded`, () => {
  chrome.runtime.getBackgroundPage(background => {
    populate(background.recipeData)
  })
})

// Download text as .txt file

const download = () => {
  // Getting text into a downloadable format
  const text = document.getElementsByTagName(`textarea`)[0].innerHTML
  const textAsBlob = new Blob([text], {type : `text/plain`})
  const fileNameToSaveAs = document.getElementsByTagName(`input`)[0].value

  // Triggering download
  const downloadLink = document.createElement(`a`)
  downloadLink.download = fileNameToSaveAs
  downloadLink.innerHTML = `Download Recipe`
  downloadLink.href = window.URL.createObjectURL(textAsBlob)
  downloadLink.onclick = event => {document.body.removeChild(event.target)}
  downloadLink.style.display = `none`
  document.body.appendChild(downloadLink)
  downloadLink.click()
  alert(`Saved to your downloads folder`)
}