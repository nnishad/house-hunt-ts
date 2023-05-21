import puppeteer, { Page } from 'puppeteer';
import logger from '../custom-logger';
import fs from 'fs';
import { generateHTMLContent } from '../util/emailTemplate';
import sendEmail from '../util/sendEmail';
const FILE_PATH = 'ids.txt';

async function getPropertyDetails(page: Page, index: number) {
  const propertyDetails = await page.evaluate((index) => {
    const elementSelector = `.l-searchResult[data-test="propertyCard-${index}"]`;
    const base_url = 'https://www.rightmove.co.uk';
    const propertyCard = document.querySelector(elementSelector);
    const propertyId = propertyCard?.id;
    const price = propertyCard?.querySelector(
      '.propertyCard-priceValue',
    )?.textContent;
    const address = propertyCard?.querySelector(
      '.propertyCard-address',
    )?.textContent;
    const description = propertyCard?.querySelector(
      '.propertyCard-description span',
    )?.textContent;
    const bedrooms = propertyCard?.querySelector(
      '.no-svg-bed-icon + .text',
    )?.textContent;
    const bathrooms = propertyCard?.querySelector(
      '.no-svg-bathroom-icon + .text',
    )?.textContent;
    const telephone = propertyCard?.querySelector(
      '.propertyCard-contactsPhoneNumber',
    )?.textContent;
    const propertyLink =
      base_url +
      propertyCard
        ?.querySelector('.propertyCard-link[data-test="property-details"]')
        ?.getAttribute('href');
    const contactLink =
      base_url +
      propertyCard
        ?.querySelector('.action[data-test="contact-agent-email-icon"]')
        ?.getAttribute('href');
    const additional = propertyCard?.querySelector(
      '.propertyCard-detailsFooter',
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
      additional,
    };
  }, index);
  return propertyDetails;
}

function appendIdsToFile(newIds: string[]): void {
  const fileData = fs.readFileSync(FILE_PATH, { encoding: 'utf8', flag: 'a+' });
  const ids = fileData.split('\n');

  for (const id of newIds) {
    if (!ids.includes(id)) {
      ids.push(id);
      console.log(`ID ${id} appended to file`);
    } else {
      console.log(`ID ${id} already exists in file`);
    }
  }

  const updatedData = ids.join('\n');
  fs.writeFileSync(FILE_PATH, updatedData);
  console.log('IDs appended to file');
}

function checkIfIdExists(id: string): boolean {
  const fileData = fs.readFileSync(FILE_PATH, { encoding: 'utf8', flag: 'a+' });
  const ids = fileData.split('\n');

  return ids.includes(id);
}

function alertForProperty(propertyDetailsList: any[], taggedUsers: any[]) {
  // Generate the HTML content using the property object
  const htmlContent = generateHTMLContent(propertyDetailsList);
  taggedUsers.forEach((userEmail) => {
    sendEmail(htmlContent, userEmail).then(() =>
      logger.info(`Alert sen to ${userEmail}`),
    );
  });
}

export const fetchProperties = (alert: any) => {
  (async () => {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.goto('https://www.rightmove.co.uk/');

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    // Type into search box
    await page.type('input[name="typeAheadInputField"]', 'G1 5AE');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    await page.goto(
      'https://www.rightmove.co.uk/property-to-rent/find.html?' +
        'searchType=RENT' +
        `&locationIdentifier=${alert.locationIdentifier}` +
        '&insId=1' +
        `&radius=${alert.radius}` +
        '&minPrice=' +
        `&maxPrice=${alert.maxPrice}` +
        `&minBedrooms=${alert.minBedrooms}` +
        '&maxBedrooms=' +
        '&displayPropertyType=' +
        '&maxDaysSinceAdded=' +
        '&sortByPriceDescending=' +
        '&_includeLetAgreed=on' +
        '&primaryDisplayPropertyType=' +
        '&secondaryDisplayPropertyType=' +
        '&oldDisplayPropertyType=' +
        '&oldPrimaryDisplayPropertyType=' +
        '&letType=' +
        `&letFurnishType=${alert.letFurnishType}` +
        '&houseFlatShare=',
    );

    // Wait and click on first result
    const searchResultSelector = '.is-list';
    await page.waitForSelector(searchResultSelector);

    const properties = await page.$$(searchResultSelector);
    // const propertyElements = await page.$$('.propertyCard');
    const propertyDetailsList = [];
    for (let index = 0; index < properties.length; index++) {
      const propertyDetails = await getPropertyDetails(page, index);
      const { propertyId } = propertyDetails;
      if (propertyId !== undefined && !checkIfIdExists(propertyId)) {
        propertyDetailsList.push(propertyDetails);
      }
    }
    if (propertyDetailsList.length > 0) {
      alertForProperty(propertyDetailsList, alert.taggedUsers);
      appendIdsToFile(
        propertyDetailsList.map((property) => property?.propertyId ?? ''),
      );
    } else {
      logger.info('No new property found');
    }
    await browser.close();
  })();
};
