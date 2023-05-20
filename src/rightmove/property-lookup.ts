import puppeteer, { Page } from "puppeteer";
import logger from "../custom-logger";

async function getPropertyDetails(page: Page, index: number) {
  const propertyDetails = await page.evaluate((index) => {
    const elementSelector = `.l-searchResult[data-test="propertyCard-${index}"]`;
    const base_url = "https://www.rightmove.co.uk";
    const propertyCard = document.querySelector(elementSelector);
    const propertyId = propertyCard?.id;
    const price = propertyCard?.querySelector(
      ".propertyCard-priceValue"
    )?.textContent;
    const address = propertyCard?.querySelector(
      ".propertyCard-address"
    )?.textContent;
    const description = propertyCard?.querySelector(
      ".propertyCard-description span"
    )?.textContent;
    const bedrooms = propertyCard?.querySelector(
      ".no-svg-bed-icon + .text"
    )?.textContent;
    const bathrooms = propertyCard?.querySelector(
      ".no-svg-bathroom-icon + .text"
    )?.textContent;
    const telephone = propertyCard?.querySelector(
      ".propertyCard-contactsPhoneNumber"
    )?.textContent;
    const propertyLink =
      base_url +
      propertyCard
        ?.querySelector(".propertyCard-link[data-test=\"property-details\"]")
        ?.getAttribute("href");
    const contactLink =
      base_url +
      propertyCard
        ?.querySelector(".action[data-test=\"contact-agent-email-icon\"]")
        ?.getAttribute("href");
    const additional = propertyCard?.querySelector(
      ".propertyCard-detailsFooter"
    )?.textContent;

    return {
      propertyId,
      price,
      address,
      description,
      bedrooms,
      bathrooms,
      telephone,
      contactLink,
      propertyLink,
      additional
    };
  }, index);
}

export const fetchProperties = () => {
  (async () => {
    const browser = await puppeteer.launch({
      executablePath:
        "/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta",
      headless: false,
      userDataDir:
        "/Users/nnishad/Library/Application Support/Google/Chrome Beta"
    });

    const page = await browser.newPage();
    logger.info("This is a log message");

    await page.goto("https://www.rightmove.co.uk/");

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    // Type into search box
    await page.type("input[name=\"typeAheadInputField\"]", "G1 5AE");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    await page.goto(
      "https://www.rightmove.co.uk/property-to-rent/find.html?" +
      "searchType=RENT&locationIdentifier=OUTCODE%5E923" +
      "&insId=1" +
      "&radius=0.0" +
      "&minPrice=" +
      "&maxPrice=" +
      "&minBedrooms=" +
      "&maxBedrooms=" +
      "&displayPropertyType=" +
      "&maxDaysSinceAdded=" +
      "&sortByPriceDescending=" +
      "&_includeLetAgreed=on" +
      "&primaryDisplayPropertyType=" +
      "&secondaryDisplayPropertyType=" +
      "&oldDisplayPropertyType=" +
      "&oldPrimaryDisplayPropertyType=" +
      "&letType=" +
      "&letFurnishType=" +
      "&houseFlatShare="
    );

    // Wait and click on first result
    const searchResultSelector = ".is-list";
    await page.waitForSelector(searchResultSelector);

    const properties = await page.$$(searchResultSelector);
    // const propertyElements = await page.$$('.propertyCard');

    for (let index = 0; index < properties.length; index++) {
      await getPropertyDetails(page, index);
    }

    await browser.close();
  })();
};
