// Tragically, chrome extensions do not support modularization of content scripts
// There are several ugly, brutal hacks for this, but ultimately they're even riskier
// and more of a hassle than just doing it all in one file
// Pray for modularization support to come someday

let recipeData

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    console.log(`CONTENTS LISTENER HIT`)
    if(message.tab){
      console.log(`MESSAGE.TAB HIT`)
      recipeData = scrape(message.tab.url)
      console.log(recipeData)
    }
    sendResponse(recipeData)
  }
)

const recipeToStr = recipe => {
  let recipeStr = `${recipe.title}\n\nIngredients\n`
  recipe.ingredients.forEach(ingredient => {
    recipeStr += `\n    ${ingredient}`
  })
  recipeStr += `\n\nInstructions\n`
  recipe.instructions.forEach((instruction, i) => {
    recipeStr += `\n    ${i + 1}) ${instruction}`
  })
  return recipeStr
}

/* eslint-disable complexity */ // Ignores "massively" complex parsers clause
const scrape = url => {
  const recipe = {
    title : ``,
    ingredients : [],
    instructions : [],
  }
  const recipeData = {
    title : ``,
    source : ``,
    recipe : ``,
  }
  const parserLoader = (parser, source) => {
    parser(recipe)
    recipeData.source = source
  }
  // Deals with the edge case seriousEats pages
  if(
    url.includes(`seriouseats.com`) &&
      !url.includes(`seriouseats.com/recipes`)
  ){
    return `Make sure your URL is at seriouseats.com/recipes, not just seriouseats.com`
    // Clauses to let you use different parsers for different websites
    // >>>>>>>>>>>>>>>>>>>> TESTED ALL ABOVE <<<<<<<<<<<<<<<<<<<< // movable line for testing day
  }else if(url.includes(`allrecipes.com`)){ // allrecipes
    parserLoader(allrecipes, `allrecipes.com`)
  }else if(url.includes(`bettycrocker.com`)){ // bettycrocker
    parserLoader(bettycrocker, `bettycrocker.com`)
  }else if(url.includes(`bonappetit.com`)){ // bonappetit
    parserLoader(bonappetit, `bonappetit.com`)
  }else if(url.includes(`chowhound.com`)){ // chowhound
    parserLoader(chowhound, `chowhound.com`)
  }else if(url.includes(`cookinglight.com`)){ // cookinglight
    parserLoader(cookinglight, `cookinglight.com`)
  }else if(url.includes(`eatingwell.com`)){ // eatingwell
    parserLoader(eatingwell, `eatingwell.com`)
  }else if(url.includes(`epicurious.com`)){ // epicurious
    parserLoader(epicurious, `epicurious.com`)
  }else if(url.includes(`food52.com`)){ // food52
    parserLoader(food52, `food52.com`)
  }else if(url.includes(`foodandwine.com`)){ // foodandwine
    parserLoader(foodandwine, `foodandwine.com`)
  }else if(url.includes(`foodnetwork.com`)){ // foodnetwork
    parserLoader(foodnetwork, `foodnetwork.com`)
  }else if(url.includes(`geniuskitchen.com`)){ // geniuskitchen/food
    parserLoader(geniuskitchenOrfood, `geniuskitchen.com`)
  }else if(url.includes(`jamieoliver.com`)){ // jamieoliver
    parserLoader(jamieoliver, `jamieoliver.com`)
  }else if(url.includes(`myrecipes.com`)){ // myrecipes
    parserLoader(myrecipes, `myrecipes.com`)
  }else if(url.includes(`seriouseats.com/recipes`)){ // seriouseats
    parserLoader(seriouseats, `seriouseats.com`)
  }else if(url.includes(`simplyrecipes.com`)){ // simplyrecipes
    parserLoader(simplyrecipes, `simplyrecipes.com`)
  }else if(url.includes(`thekitchn.com`)){ // thekitchn
    parserLoader(thekitchn, `thekitchn.com`)
  }else{
    return `Sorry, we don't support that website`
  }
  recipeData.title = recipe.title
  recipeData.recipe = `Source: ${url}\n\n${recipeToStr(recipe)}`
  return recipeData
}
/* eslint-enable complexity */

// Parsers

const allrecipes = recipe => {
  recipe.title = ($(`h1`).text().trim())
  $(`.checkList__line label`).each(function(){ // label is to deal with inline-ads
    recipe.ingredients.push(`• ${$(this).text().trim()}`)
  })
  recipe.ingredients = recipe.ingredients.slice(0, -1) // to deal with some HTML BS
  $(`.recipe-directions__list--item`).each(function(){
    recipe.instructions.push(`${$(this).text().trim()}`)
  })
  recipe.instructions = recipe.instructions.slice(0, -1) // to deal with some HTML BS
}

const bettycrocker = recipe => {
  recipe.title = ($(`h1`).text())
  $(`.recipePartIngredient`).each(function(){
    recipe.ingredients.push(`• ${$(this).text().trim()
      .slice(0, -8)}` // to deal with inline ads
      .replace(/\s\s+/g, ` `)) // to deal with some html whitespace BS
  })
  $(`.recipePartStepDescription`).each(function(){
    recipe.instructions.push(`${$(this).text().trim()}`)
  })
}

const bonappetit = recipe => {
  recipe.title = ($(`h1`).text())
  $(`.ingredients__text`).each(function(){
    recipe.ingredients.push(`• ${$(this).text().trim()}`)
  })
  $(`.step`).each(function(){
    recipe.instructions.push(`${$(this).text().trim()}`)
  })
}

const chowhound = recipe => {
  recipe.title = ($(`h1`).text())
  $(`.freyja_box.freyja_box81 ul li`).each(function(){
    recipe.ingredients.push(`• ${$(this).text().trim()}`)
  })
  $(`.freyja_box.freyja_box82 ol li`).each(function(){
    recipe.instructions.push(`${$(this).text().trim()
      .slice(18)}`)
  })
}

const cookinglight = recipe => {
  recipe.title = ($(`h1`).text())
  $(`.ingredients li`).each(function(){
    recipe.ingredients.push(`• ${$(this).text().trim()}`)
  })
  $(`.step p`).each(function(){
    recipe.instructions.push(`${$(this).text().trim()}`)
  })
}

const eatingwell = recipe => {
  recipe.title = ($(`h1`).text())
  $(`.checkListListItem.checkListLine > span`).each(function(){
    recipe.ingredients.push(`• ${$(this).text().trim()}`)
  })
  $(`.recipeDirectionsListItem`).each(function(){
    recipe.instructions.push(`${$(this).text().trim()}`)
  })
  recipe.instructions = recipe.instructions.slice(0, -1) // to deal with some html BS
}

const epicurious = recipe => {
  recipe.title = ($(`h1`).text().trim())
  $(`.ingredient`).each(function(){
    recipe.ingredients.push(`• ${$(this).text().trim()}`)
  })
  $(`.preparation-step`).each(function(){
    recipe.instructions.push(`${$(this).text().trim()}`)
  })
}

const food52 = recipe => {
  recipe.title = ($(`h1`).text().trim())
  $(`.recipe-list li`).each(function(){
    recipe.ingredients.push(`• ${$(this).text().trim()}`
      .replace(/\s\s+/g, ` `)) // to deal with some html whitespace BS
  })
  $(`.clearfix ol li`).each(function(){
    recipe.instructions.push(`${$(this).text().trim()}`)
  })
}

const foodandwine = recipe => {
  recipe.title = ($(`h1`).text())
  $(`.ingredients li`).each(function(){
    recipe.ingredients.push(`• ${$(this).text().trim()}`)
  })
  $(`.step`).each(function(){
    if($(this).attr(`itemprop`) === `recipeInstructions`){
      recipe.instructions.push(`${$(this).children(`p`).text()
        .trim()}`)
    }
  })
}

const foodnetwork = recipe => {
  recipe.title = ($(`.o-AssetTitle__a-HeadlineText`).text().trim()
    .slice(0, -16))
  $(`.o-Ingredients__a-ListItem`).each(function(){
    recipe.ingredients.push(`• ${$(this).text().trim()}`)
  })
  $(`.o-Method__m-Body p`).each(function(){
    recipe.instructions.push(`${$(this).text().trim()}`)
  })
  if(recipe.instructions[recipe.instructions.length - 1].includes(`Photographs by`)){ // to deal with the many FN.com recipes where the final "instruction" is a PC
    recipe.instructions = recipe.instructions.slice(0, -1) // this is an ugly and graceless fix, but they have ugly and graceless html and I'm doing the best I can
  }
}

const geniuskitchenOrfood = recipe => {
  recipe.title = ($(`h1`).text())
  $(`.ingredient-list li`).each(function(){
    recipe.ingredients.push(`• ${$(this).text().trim()}`)
  })
  $(`ol li`).slice(0, -1).each(function(){
    recipe.instructions.push(`${$(this).text().trim()}`)
  })
}

const jamieoliver = recipe => {
  recipe.title = ($(`h1`).text())
  $(`.ingred-list li`).each(function(){
    recipe.ingredients.push(`• ${$(this).text().trim()
      .replace(/\s\s+/g, ` `)}`) // to deal with some html whitespace BS
  })
  $(`.recipeSteps li`).each(function(){
    recipe.instructions.push(`${$(this).text().trim()}`)
  })
}

const myrecipes = recipe => {
  recipe.title = ($(`h1`).text())
  $(`.ingredients li`).each(function(){
    recipe.ingredients.push(`• ${$(this).text().trim()}`)
  })
  $(`.step p`).each(function(){
    recipe.instructions.push(`${$(this).text().trim()}`
    )
  })
}

const seriouseats = recipe => {
  recipe.title = ($(`h1`).text())
  $(`.ingredient`).each(function(){
    recipe.ingredients.push(`• ${$(this).text().trim()}`)
  })
  $(`.recipe-procedure-text`).each(function(){
    recipe.instructions.push(`${$(this).text().trim()}`)
  })
}

const simplyrecipes = recipe => {
  recipe.title = ($(`h1`).text())
  $(`.ingredient`).each(function(){
    recipe.ingredients.push(`• ${$(this).text().trim()}`)
  })
  $(`.entry-details.recipe-method.instructions p`).each(function(){
    if(`${$(this).text().trim()}` !== ``){
      recipe.instructions.push(`${$(this).text().trim()}`
        .replace(/^[\s\d]+/, ``)) // to deal with inline numbers
    }
  })
}

const thekitchn = recipe => {
  recipe.title = ($(`h1`).text().trim())
  $(`.PostRecipeIngredientGroup__ingredient`).each(function(){
    recipe.ingredients.push(`• ${$(this).text().trim()}`)
  })
  $(`.PostRecipeInstructionGroup__step`).each(function(){
    recipe.instructions.push(`${$(this).text().trim()}`)
  })
}