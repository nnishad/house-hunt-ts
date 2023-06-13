# UK House Hunt Automation

The UK House Hunt Automation project is a TypeScript-based automation solution that utilizes Puppeteer for web scraping and MongoDB for data storage. It aims to simplify and enhance your house hunting process by automatically notifying you whenever a new property is listed that matches your specified filters. With this automation solution, you can stay up-to-date with the latest property listings without manually checking multiple websites. Let's find your dream home!

## Features

- **Automated Property Monitoring**: The automation script uses Puppeteer to scrape popular property listing websites in the UK, such as Rightmove and Zoopla, to check for new property listings.
- **Customizable Filters**: You can define your preferred filters, including location, price range, number of bedrooms, property type, and any other criteria relevant to your house hunt.
- **Real-time Notifications**: Whenever a new property that matches your filters is found, you will receive instant notifications via email, SMS, or any other notification method of your choice.
- **Efficient Data Storage**: The project utilizes MongoDB to store the scraped property data, allowing you to review and manage the listings conveniently.
- **Flexible and Extensible**: The codebase is built using TypeScript, Puppeteer, and MongoDB, enabling easy customization and expansion to suit your specific requirements.

## Prerequisites

Before running the automation script, make sure you have the following:

- Node.js and npm installed on your machine.
- MongoDB set up and running.

## Getting Started

1. Clone this repository to your local machine.
2. Install the dependencies by running `npm install`.
3. Configure the automation script with your preferred filters and notification settings in `config.ts`.
4. Start your MongoDB server.
5. Build the TypeScript code by running `npm run build`.
6. Run the automation script using `npm start`.
7. Sit back and let the automation scan for new property listings and notify you whenever a match is found.

## Customization

You can customize the automation script to fit your specific house hunting preferences:

- Modify the filters `use swagger endpoints` to define your desired location, price range, number of bedrooms, property type, and any additional criteria.
- Adjust the scraping logic in `rightmove package` to handle additional property listing websites or extract more data points if desired.

## Limitations

- The automation script relies on web scraping techniques and may be subject to changes in the structure or policies of the property listing websites it interacts with. Regular updates to the script may be required to ensure continued functionality.
- Please use this automation project responsibly and respect the terms of service and usage policies of the property listing websites.

## Contributing

Contributions to this automation project are welcome! If you encounter any issues, have suggestions for improvements, or want to add new features, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

---

Feel free to modify the above content to reflect the specific details and requirements of your project. Include any necessary instructions, customization options, and additional information that may be relevant to users interested in using or contributing to your house hunting automation solution.
