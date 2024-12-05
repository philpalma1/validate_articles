// This program will navigate to the Hacker News website and verify that the articles are sorted from newest to oldest

const { chromium } = require("playwright");

async function validateArticles() {
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  // Give the page time to load
  await page.waitForSelector(".athing");

  // Declare body of main table
  const body = await page.locator("table#hnmain tbody tr td table");

  // Get number of rows in the table and print total
  const totalRows = await body.locator("tr").count();
  console.log(totalRows);

  // Locate the table containing the articles
  const tableLocator = await page.locator("table#hnmain tbody tr td table");

  // Create array for storing datetimes
  let ages = new Array();


  while (ages.length < 100) {
    // Loop over each row, starting with the second row (Skipping the header)
    for (let i = 1; i <= totalRows; i++) {
      //DELETE const second_row_text = await tableLocator.locator("tr").nth(i).locator(":scope").allInnerTexts();

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

        // Add article age to array
        if (spanExists && ages.length < 100) {

          // Extract the age of the post from the 'title' attribute, convert to datetime & add to array
          const age = await spanLocator.getAttribute("title");
          const dateObject = new Date(age.substring(0, 19) + "Z");
          ages.push(dateObject);
        } else {
          continue;
        }
      }
    }

    await page.locator("a.morelink").click();

  }

  console.log(ages);
  

  // Close browser
  await browser.close();
}

(async () => {
  await validateArticles();
})();
