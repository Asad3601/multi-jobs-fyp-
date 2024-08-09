const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const Jobs = require('../models/Jobs');


async function byat_com(q) {
    try {
        let query = q;

        // Replace spaces with '+' if the query contains multiple words
        query = query.trim().replace(/\s+/g, '-');


        // Set up WebDriver with Chrome in headless mode
        let options = new chrome.Options();
        // options.addArguments('headless'); // This is the correct way to set headless mode
        // options.addArguments('disable-gpu'); // Add other arguments as needed

        let driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        let results = [];

        for (let page = 1; page <= 5; page++) {

            const url = `https://www.bayt.com/en/pakistan/jobs/${query}-jobs/?page=${page}&_gl=1*16zuk74*_up*MQ..*_ga*Nzg2NTkwNTU0LjE3MjI5MzYyNjI.*_ga_1NKPLGNKKD*MTcyMjkzNjI2Mi4xLjAuMTcyMjkzNjI2Mi4wLjAuMA..`
                // Navigate to the URL
            await driver.get(url);

            // Extract data from the specified elements
            let articles = await driver.findElements(By.className('has-pointer-d'));
            for (let article of articles) {
                let result = {};

                let titleElement = await article.findElement(By.css('h2'));
                result.title = await titleElement.getText();

                let aTagElement = await titleElement.findElement(By.css('a'));
                result.href = (await aTagElement.getAttribute('href'));

                let locElement = await article.findElement(By.className('col u-stretch t-nowrap t-small p10l'));
                result.location = await locElement.getText();

                let contentElement = await article.findElement(By.className('m10t t-small'));
                result.content = await contentElement.getText();
                results.push(result);
            }
        }

        // Quit the driver
        await driver.quit();
        // res.json(results);

    } catch (error) {
        console.error('Error fetching data:', error);

    }
};















// Export the function
module.exports = {
    byat_com
};