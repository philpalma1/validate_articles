// This program will navigate to the Hacker News website and verify that the articles are sorted from newest to oldest

const { chromium } = require("playwright");

// Create variable to hold the number of the out of order article
let marker = 0;

async function validateArticles() {
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  // Give the page time to load
  await page.waitForSelector(".athing");

  // Locate the table containing the articles
  const tableLocator = await page.locator("table#hnmain tbody tr td table");

  // Get number of rows in the table
  const totalRows = await tableLocator.locator("tr").count();

  // Create array for storing datetimes
  let ages = new Array();

  // (TESTING USE ONLY) Force article ages to be OUT OF ORDER
  //const dateTest = new Date("2024-12-05T06:50:13Z");
  //ages.push(dateTest);

  // Check if age array is full
  while (ages.length < 100) {

    // Loop over each row, starting with the second row (Skipping the header)
    for (let i = 1; i <= totalRows; i++) {

      // Locate the nth row, columns in the row, and get the # of columns
      const rowLocator = await tableLocator.locator("tr").nth(i);
      const columnsLocator = await rowLocator.locator("td");
      const numOfColumns = await columnsLocator.count();

      // Loop over each column
      for (let j = 0; j < numOfColumns; j++) {

        // Locate the nth column & span element containing date & time
        const columnLocator = await columnsLocator.nth(j);
        const spanLocator = await columnLocator.locator("span.age");

        // Verify span element exists in the column
        const spanExists = await spanLocator.count() > 0;

        // Add article age to array only if there are less than 100 elements
        if (spanExists && ages.length < 100) {

          // Extract the age of the post from the 'title' attribute, convert to datetime & add to array
          const age = await spanLocator.getAttribute("title");
          const dateObject = new Date(age.substring(0, 19) + "Z");
          ages.push(dateObject);

          // When there is more than one age in the array, check if it is in the correct order
          if ((ages.length > 0) && (ages[ages.length - 1] > ages[ages.length - 2])) {

            // Close browser and return false if articles are out of order
            await browser.close();
            marker = ages.length - 1;
            return false;
          };
        } else {

          // Continue running if span element does not exist
          continue;
        };
      };
    };

    // Go to the next page
    await page.locator("a.morelink").click();
  };
  
  // Close browser and return true when articles are in order
  await browser.close();
  return true;
};

(async () => {

  // Print results to console
  if (await validateArticles()) {
    console.log("Articles are in order.");
  } else {
    console.log("Articles are out of order starting with article " + marker + ".");
  };
})();
