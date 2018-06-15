// Populate textbox
const populate = recipeStr => {
  console.log(`POPULATE HIT`, recipeStr)
  if(recipeStr){
    document.getElementsByTagName(`textarea`)[0].innerHTML = recipeStr
  }
}

window.addEventListener(`DOMContentLoaded`, () => {
  document.getElementsByTagName(`button`)[0].addEventListener(`click`, download)
  chrome.runtime.getBackgroundPage(background => {
    console.log(background)
    populate(background.recipeStr)
  })
})

const download = () => {
  const text = document.getElementsByTagName(`textarea`)[0].innerHTML
  const textAsBlob = new Blob([text], {type : `text/plain`})
  const fileNameToSaveAs = document.getElementsByTagName(`input`)[0].value

  const downloadLink = document.createElement(`a`)
  downloadLink.download = fileNameToSaveAs
  downloadLink.innerHTML = `Download File`
  if(window.webkitURL != null){
    // Chrome allows the link to be clicked
    // without actually adding it to the DOM.
    downloadLink.href = window.webkitURL.createObjectURL(textAsBlob)
  }else{
    // Firefox requires the link to be added to the DOM
    // before it can be clicked.
    downloadLink.href = window.URL.createObjectURL(textAsBlob)
    downloadLink.onclick = destroyClickedElement
    downloadLink.style.display = `none`
    document.body.appendChild(downloadLink)
  }

  downloadLink.click()
}

function destroyClickedElement(event)
{
  document.body.removeChild(event.target)
}