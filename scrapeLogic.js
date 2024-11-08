const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  try {
    const page = await browser.newPage();

    // Navigate to the page and wait until network is idle
    await page.goto("https://developer.chrome.com/", {
      waitUntil: "networkidle0",
      timeout: 60000, // Increase timeout to 60 seconds
    });

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    // Wait for the search button to be visible and click it
    const searchButtonSelector = '[data-type="search"]';
    await page.waitForSelector(searchButtonSelector, { visible: true });
    await page.click(searchButtonSelector);

    // Wait for the search input to be visible
    const searchInputSelector = '#searchbox input[type="search"]';
    await page.waitForSelector(searchInputSelector, { visible: true });
    
    // Type the search query
    await page.type(searchInputSelector, "automate beyond recorder");

    // Press Enter to perform the search
    await page.keyboard.press('Enter');

    // Wait for search results
    await page.waitForSelector('a[data-card-type="article"]', { timeout: 5000 });

    // Get the first article title
    const firstArticleTitle = await page.$eval('a[data-card-type="article"]', el => el.textContent);

    // Print the full title
    const logStatement = `The title of this blog post is: ${firstArticleTitle.trim()}`;
    console.log(logStatement);
    res.send(logStatement);
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
