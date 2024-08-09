const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const Jobs = require('../models/Jobs');


async function byat_com(q) {
    let driver;
    try {
        let query = q.trim().replace(/\s+/g, '-'); // Replace spaces with '-' for the URL

        // Set up WebDriver with Chrome in headless mode
        let options = new chrome.Options();
        // options.addArguments('headless'); // Use headless mode
        // options.addArguments('disable-gpu'); // Disable GPU (optional)

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        for (let page = 1; page <= 3; page++) {
            const url = `https://www.bayt.com/en/pakistan/jobs/${query}-jobs/?page=${page}&_gl=1*16zuk74*_up*MQ..*_ga*Nzg2NTkwNTU0LjE3MjI5MzYyNjI.*_ga_1NKPLGNKKD*MTcyMjkzNjI2Mi4xLjAuMTcyMjkzNjI2Mi4wLjAuMA..`;
            await driver.get(url);

            // Extract data from the specified elements
            let articles = await driver.findElements(By.className('has-pointer-d'));
            for (let article of articles) {
                let result = {};
                try {
                    let titleElement = await article.findElement(By.css('h2'));
                    result.title = await titleElement.getText();

                    let aTagElement = await titleElement.findElement(By.css('a'));
                    result.href = await aTagElement.getAttribute('href');

                    let locElement = await article.findElement(By.className('col u-stretch t-nowrap t-small p10l'));
                    result.location = await locElement.getText();

                    let contentElement = await article.findElement(By.className('m10t t-small'));
                    result.content = await contentElement.getText();

                    if (result.title && result.href && result.location && result.content) {
                        // Save job to MongoDB
                        let job = new Jobs({
                            job_title: result.title,
                            job_url: result.href,
                            company: result.location, // Adjust according to the correct data
                            description: result.content
                        });

                        try {
                            await job.save();
                        } catch (dbError) {
                            console.error('Error saving job to database:', dbError);
                        }
                    }
                } catch (e) {
                    console.error('Error extracting element:', e);
                    // Continue with the next article if any element is missing
                }
            }
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        if (driver) {
            await driver.quit(); // Ensure the driver is closed even if an error occurs
        }
    }
}

module.exports = byat_com;















// Export the function
module.exports = {
    byat_com
};