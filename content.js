// Tragically, chrome extensions do not support modularization of content scripts
// There are several ugly, brutal hacks for this, but ultimately they're even riskier
// and more of a hassle than just doing it all in one file
// Pray for modularization support to come someday

/* global chrome:false */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let recipeData = {}
  if (message.tab.url) { recipeData = scrape(message.tab.url) }
  sendResponse(recipeData)
})

const getCleanStrings = (selector, context = null, additionalCleaners = []) => (context ? $(selector, context) : $(selector))
  .map(function() {
    let res = $(this).text().trim()
      .replace(/\s+/g, ` `)

    additionalCleaners.forEach(([filter, replacer = ``]) => {
      res = res.replace(filter, replacer)
    })

    return res
  })
  .get()
  .filter(string => Boolean(string))

const getRecipe = (url, title, ingredients, instructions) => [
  `Source: ${url}`,
  ``,
  title[0],
  ``,
  `Ingredients`,
  ``,
  ...ingredients,
  ``,
  `Instructions`,
  ``,
  ...instructions.reduce((formattedInstructions, instruction) => {
    formattedInstructions.push(instruction)
    formattedInstructions.push(``)
    return formattedInstructions
  }, []), // each instruction with a line break between
].join(`\n`)

const scrape = url => {
  // Deals with edge case seriousEats pages
  if (url.includes(`seriouseats.com`) && !url.includes(`seriouseats.com/recipes`)) {
    return { recipe: `Make sure your URL is at seriouseats.com/recipes, not just seriouseats.com` }
  } else if (url.includes(`allrecipes.com`)) {
    return allrecipes(url)
  } else if (url.includes(`bettycrocker.com`)) {
    return bettycrocker(url)
  } else if (url.includes(`bonappetit.com`)) {
    return bonappetit(url)
  } else if (url.includes(`chowhound.com`)) {
    return chowhound(url)
  } else if (url.includes(`cookinglight.com`)) {
    return cookinglight(url)
  } else if (url.includes(`eatingwell.com`)) {
    return eatingwell(url)
  } else if (url.includes(`epicurious.com`)) {
    return epicurious(url)
  } else if (url.includes(`food.com`)) {
    return food(url)
  } else if (url.includes(`food52.com`)) {
    return food52(url)
  } else if (url.includes(`foodandwine.com`)) {
    return foodandwine(url)
  } else if (url.includes(`foodnetwork.com`)) {
    return foodnetwork(url)
  } else if (url.includes(`jamieoliver.com`)) {
    return jamieoliver(url)
  } else if (url.includes(`myrecipes.com`)) {
    return myrecipes(url)
  } else if (url.includes(`seriouseats.com/recipes`)) {
    return seriouseats(url)
  } else if (url.includes(`simplyrecipes.com`)) {
    return simplyrecipes(url)
  } else if (url.includes(`thekitchn.com`)) {
    return thekitchn(url)
  } else {
    return {}
  }
}

// Parsers

const allrecipes = url => {
  const title = getCleanStrings(`.headline-wrapper`)
  const ingredients = getCleanStrings(`.ingredients-item`)
  const instructions = getCleanStrings(`.section-body`, `.instructions-section`)

  return {
    sourceSite: `allrecipes.com`,
    sourceUrl: url,
    text: getRecipe(url, title, ingredients, instructions),
    title: title[0],
  }
}

const bettycrocker = url => {
  const title = getCleanStrings(`h1`)
  const ingredients = getCleanStrings(`.recipePartIngredient`)
  const instructions = getCleanStrings(`.recipePartStepDescription`)

  return {
    sourceSite: `bettycrocker.com`,
    sourceUrl: url,
    text: getRecipe(url, title, ingredients, instructions),
    title: title[0],
  }
}

const bonappetit = url => {
  const title = getCleanStrings(`h1`)
  const ingredients = getCleanStrings(`.ingredients__text`)
  const instructions = getCleanStrings(`.step`)

  return {
    sourceSite: `bonappetit.com`,
    sourceUrl: url,
    text: getRecipe(url, title, ingredients, instructions),
    title: title[0],
  }
}

const chowhound = url => {
  const title = getCleanStrings(`h1`)
  const ingredients = getCleanStrings(`.freyja_box.freyja_box81 ul li`)
  const instructions = getCleanStrings(`.freyja_box.freyja_box82 ol li`, null, [[/^[\s\d]+/]]) // to deal with leading numbers/spaces

  return {
    sourceSite: `chowhound.com`,
    sourceUrl: url,
    text: getRecipe(url, title, ingredients, instructions),
    title: title[0],
  }
}

const cookinglight = url => {
  const title = getCleanStrings(`h1`)
  const ingredients = getCleanStrings(`.ingredients li`)
  const instructions = getCleanStrings(`.step p`)

  return {
    sourceSite: `cookinglight.com`,
    sourceUrl: url,
    text: getRecipe(url, title, ingredients, instructions),
    title: title[0],
  }
}

const eatingwell = url => {
  let title
  let ingredients
  let instructions

  // two known recipe page templates; one without a main with that class, one with
  if ($(`body`).hasClass(`template-recipe`)) {
    title = getCleanStrings(`.headline-wrapper`)
    ingredients = getCleanStrings(`.ingredients-item`)
    instructions = getCleanStrings(`.section-body`, `.instructions-section`)
  } else {
    title = getCleanStrings(`.hideOnTabletToDesktop`)
    ingredients = getCleanStrings(`.checkListListItem.checkListLine span`)
    instructions = getCleanStrings(`.recipeDirectionsListItem`)
  }
  return {
    sourceSite: `eatingwell.com`,
    sourceUrl: url,
    text: getRecipe(url, title, ingredients, instructions),
    title: title[0],
  }
}

const epicurious = url => {
  const title = getCleanStrings(`h1`)
  const ingredients = getCleanStrings(`.ingredient`)
  const instructions = getCleanStrings(`.preparation-step`)

  return {
    sourceSite: `epicurious.com`,
    sourceUrl: url,
    text: getRecipe(url, title, ingredients, instructions),
    title: title[0],
  }
}

const food = url => {
  const title = getCleanStrings(`h1`)
  const ingredients = getCleanStrings(`.recipe-ingredients__item`)
  const instructions = getCleanStrings(`.recipe-directions__step`)

  return {
    sourceSite: `food.com`,
    sourceUrl: url,
    text: getRecipe(url, title, ingredients, instructions),
    title: title[0],
  }
}

const food52 = url => {
  const title = getCleanStrings(`h1`)
  const ingredients = getCleanStrings(`.recipe__list--ingredients li`, `#recipeDirectionsRoot`)
  const instructions = getCleanStrings(`.clearfix ol li`)

  return {
    sourceSite: `food52.com`,
    sourceUrl: url,
    text: getRecipe(url, title, ingredients, instructions),
    title: title[0],
  }
}

const foodandwine = url => {
  const title = getCleanStrings(`h1`)
  const ingredients = getCleanStrings(`.ingredients li`)
  const instructions = getCleanStrings(`.step p`)

  return {
    sourceSite: `foodandwine.com`,
    sourceUrl: url,
    text: getRecipe(url, title, ingredients, instructions),
    title: title[0],
  }
}

const foodnetwork = url => {
  const title = getCleanStrings(`h1`)
  const ingredients = getCleanStrings(`.o-Ingredients__m-Body p`)
  const instructions = getCleanStrings(`.o-Method__m-Body ol li`)

  return {
    sourceSite: `foodnetwork.com`,
    sourceUrl: url,
    text: getRecipe(url, title, ingredients, instructions),
    title: title[0],
  }
}

const jamieoliver = url => {
  const title = getCleanStrings(`h1`)
  const ingredients = getCleanStrings(`.ingred-list li`)
  const instructions = getCleanStrings(`.recipeSteps li`)

  return {
    sourceSite: `jamieoliver.com`,
    sourceUrl: url,
    text: getRecipe(url, title, ingredients, instructions),
    title: title[0],
  }
}

const myrecipes = url => {
  const title = getCleanStrings(`h1`)
  const ingredients = getCleanStrings(`.ingredients li`)
  const instructions = getCleanStrings(`.step p`)

  return {
    sourceSite: `myrecipes.com`,
    sourceUrl: url,
    text: getRecipe(url, title, ingredients, instructions),
    title: title[0],
  }
}

const seriouseats = url => {
  const title = getCleanStrings(`h1`)
  const ingredients = getCleanStrings(`.ingredient`)
  const instructions = getCleanStrings(`.recipe-procedure-text`)

  return {
    sourceSite: `seriouseats.com`,
    sourceUrl: url,
    text: getRecipe(url, title, ingredients, instructions),
    title: title[0],
  }
}

const simplyrecipes = url => {
  const title = getCleanStrings(`h1`)
  const ingredients = getCleanStrings(`.ingredient`)
  const instructions = getCleanStrings(`.entry-details.recipe-method.instructions p`, null, [[/^[\s\d]+/]]) // to deal with leading numbers/spaces

  return {
    sourceSite: `simplyrecipes.com`,
    sourceUrl: url,
    text: getRecipe(url, title, ingredients, instructions),
    title: title[0],
  }
}

const thekitchn = url => {
  const title = getCleanStrings(`.Recipe__title`)
  const ingredients = getCleanStrings(`.Recipe__ingredient`)
  const instructions = getCleanStrings(`.Recipe__instructionStep`)

  return {
    sourceSite: `thekitchn.com`,
    sourceUrl: url,
    text: getRecipe(url, title, ingredients, instructions),
    title: title[0],
  }
}
