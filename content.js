// Parsers
// const allrecipes = require(`./allrecipes`)
// const bettycrocker = require(`./bettycrocker`)
// const bonappetit = require(`./bonappetit`)
// const chowhound = require(`./chowhound`)
// const cookinglight = require(`./cookinglight`)
// const eatingwell = require(`./eatingwell`)
// const epicurious = require(`./epicurious`)
// const food52 = require(`./food52`)
// const foodandwine = require(`./foodandwine`)
// const foodnetwork = require(`./foodnetwork`)
// const geniuskitchenOrfood = require(`./geniuskitchenOrfood`)
// const jamieoliver = require(`./jamieoliver`)
// const myrecipes = require(`./myrecipes`)
// import seriousEats from './seriousEats'
// const simplyrecipes = require(`./simplyrecipes`)
// const thekitchn = require(`./thekitchn`)

const recipeToStr = recipe => {
  let output = `${recipe.title}\n\nIngredients\n`
  recipe.ingredients.forEach(ingredient => {
    output += `\n    ${ingredient}`
  })
  output += `\n\nInstructions\n`
  recipe.instructions.forEach((instruction, i) => {
    output += `\n    ${i + 1}) ${instruction}`
  })
  return output
}

let recipeStr

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    console.log(`CONTENTS ONMESSAGE HIT`)
    if(message.tab){
      console.log(`MESSAGE.TAB HIT`)
      recipeStr = scrape(message.tab.url)
      sendResponse({recipeStr})
    }else if(message.getRecipeStr){
      console.log(`MESSAGE.GETRECIPESTR HIT`)
      sendResponse(`recipeStr`)
    }
  }
)

$(`body`).append(`What'll happen`)

/* eslint-disable complexity */ // Ignores "massively" complex parsers clause
const scrape = (url) => {
  const recipe = {
    title : ``,
    ingredients : [],
    instructions : [],
  }
  // Deals with the edge case seriousEats pages
  if(
    url.includes(`seriouseats.com`) &&
      !url.includes(`seriouseats.com/recipes`)
  ){
    return `Make sure your URL is at seriouseats.com/recipes, not just seriouseats.com`
    // Clauses to let you use different parsers for different websites
  }else if(url.includes(`allrecipes.com`)){ // allrecipes
    allrecipes(recipe)
  // }else if(url.includes(`bettycrocker.com`)){
  //   // bettycrocker
  //   parserLoader(bettycrocker)
  // }else if(url.includes(`bonappetit.com`)){
  //   // bonappetit
  //   parserLoader(bonappetit)
  // }else if(url.includes(`chowhound.com`)){
  //   // chowhound
  //   parserLoader(chowhound)
  // }else if(url.includes(`cookinglight.com`)){
  //   // cookinglight
  //   parserLoader(cookinglight)
  // }else if(url.includes(`eatingwell.com`)){
  //   // eatingwell
  //   parserLoader(eatingwell)
  // }else if(url.includes(`epicurious.com`)){
  //   // epicurious
  //   parserLoader(epicurious)
  // }else if(url.includes(`food52.com`)){
  //   // food52
  //   parserLoader(food52)
  // }else if(url.includes(`foodandwine.com`)){
  //   // foodandwine
  //   parserLoader(foodandwine)
  // }else if(url.includes(`foodnetwork.com`)){
  //   // foodnetwork
  //   parserLoader(foodnetwork)
  // }else if(url.includes(`geniuskitchen.com`)){
  //   // geniuskitchen/food
  //   parserLoader(geniuskitchenOrfood)
  // }else if(url.includes(`jamieoliver.com`)){
  //   // jamieoliver
  //   parserLoader(jamieoliver)
  // }else if(url.includes(`myrecipes.com`)){
  //   // myrecipes
  //   parserLoader(myrecipes)
  }else if(url.includes(`seriouseats.com/recipes`)){ // seriouseats
    seriousEats(recipe)
  // }else if(url.includes(`simplyrecipes.com`)){
  //   // simplyrecipes
  //   parserLoader(simplyrecipes)
  // }else if(url.includes(`thekitchn.com`)){
  //   // thekitchn
  //   parserLoader(thekitchn)
  }else{
    return `Sorry, we don't support that website`
  }
  const recipeStr = `Source: ${url}\n\n${recipeToStr(recipe)}`
  return recipeStr
}
/* eslint-enable complexity */

const seriousEats = recipe => {
  recipe.title = ($(`h1`).text())
  $(`.ingredient`).each(function(){
    recipe.ingredients.push(`• ${$(this).text().trim()}`)
  })
  $(`.recipe-procedure-text`).each(function(){
    recipe.instructions.push(`${$(this).text().trim()}`)
  })
}

const allrecipes = recipe => {
  recipe.title = ($(`h1`).text().trim())
  $(`.checkList__line label`).each(function(){ // label is to deal with inline-ads
    recipe.ingredients.push(`• ${$(this).text().trim()}`)
  })
  recipe.ingredients = recipe.ingredients.slice(0, -3) // to deal with some HTML BS
  $(`.recipe-directions__list--item`).each(function(){
    recipe.instructions.push(`${$(this).text().trim()}`)
  })
  recipe.instructions = recipe.instructions.slice(0, -1) // to deal with some HTML BS
}