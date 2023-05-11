import puppeteer from 'puppeteer';
import logger from '../custom-logger';

(async () => {
  const browser = await puppeteer.launch({
    executablePath:
      '/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta',
    headless: false,
    userDataDir:
      '/Users/nnishad/Library/Application Support/Google/Chrome Beta',
  });

  const page = await browser.newPage();
  logger.info('This is a log message');

  await page.goto('https://developer.chrome.com/');

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  // Type into search box
  await page.type('.search-box__input', 'automate beyond recorder');

  // Wait and click on first result
  const searchResultSelector = '.search-box__link';
  await page.waitForSelector(searchResultSelector);
  await page.click(searchResultSelector);

  // Locate the full title with a unique string
  const textSelector = await page.waitForSelector(
    'text/Customize and automate',
  );
  const fullTitle = await textSelector?.evaluate((el) => el.textContent);

  // Print the full title
  console.log('The title of this blog post is "%s".', fullTitle);

  await browser.close();
})();
