const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const Jobs = require('../models/Jobs');

async function byat_com(q) {
    let driver;
    let result = {
        success: false,
        message: '',
        jobCount: 0
    };
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

        let jobCount = 0;

        for (let page = 1; page <= 3; page++) {
            const url = `https://www.bayt.com/en/pakistan/jobs/${query}-jobs/?page=${page}&_gl=1*16zuk74*_up*MQ..*_ga*Nzg2NTkwNTU0LjE3MjI5MzYyNjI.*_ga_1NKPLGNKKD*MTcyMjkzNjI2Mi4xLjAuMTcyMjkzNjI2Mi4wLjAuMA..`;
            await driver.get(url);

            // Extract data from the specified elements
            let articles = await driver.findElements(By.className('has-pointer-d'));
            for (let article of articles) {
                let job = {};
                try {
                    let titleElement = await article.findElement(By.css('h2'));
                    job.title = await titleElement.getText();

                    let aTagElement = await titleElement.findElement(By.css('a'));
                    job.href = await aTagElement.getAttribute('href');

                    let locElement = await article.findElement(By.className('col u-stretch t-nowrap t-small p10l'));
                    job.location = await locElement.getText();

                    let contentElement = await article.findElement(By.className('m10t t-small'));
                    job.content = await contentElement.getText();

                    if (job.title && job.href && job.location && job.content) {
                        // Save job to MongoDB
                        let newJob = new Jobs({
                            job_title: job.title,
                            job_url: job.href,
                            company: job.location,
                            description: job.content
                        });

                        try {
                            await newJob.save();
                            jobCount++;
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

        result.success = true;
        result.message = 'Data successfully fetched and saved.';
        result.jobCount = jobCount;
        console.log(jobCount);
    } catch (error) {
        console.error('Error fetching data:', error);
        result.message = 'An error occurred while fetching data.';
    } finally {
        if (driver) {
            await driver.quit(); // Ensure the driver is closed even if an error occurs
        }
    }

    return result; // Return result object
}


async function Job_ustad(query) {
    let driver;
    let result = {
        success: false,
        message: '',
        jobCount: 0
    };

    try {
        if (!query || query.trim().length === 0) {
            result.message = 'Query parameter is required';
            return result;
        }

        query = query.trim().replace(/\s+/g, '+'); // Replace spaces with '+' for the URL
        const url = `https://www.jobustad.com/?s=${query}`;

        // Set up WebDriver with Chrome in headless mode
        let options = new chrome.Options();
        // options.addArguments('headless'); // Uncomment this line to use headless mode
        // options.addArguments('disable-gpu'); // Uncomment this line to disable GPU

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        // Navigate to the URL
        await driver.get(url);

        let jobCount = 0;

        // Extract data from the specified elements
        let articles = await driver.findElements(By.css('div.inside-article'));
        for (let article of articles) {
            let result = {};
            try {
                // Extract title
                let titleElement = await article.findElement(By.css('header > h2'));
                result.title = await titleElement.getText();

                // Extract href
                let aTagElement = await titleElement.findElement(By.css('a'));
                result.href = await aTagElement.getAttribute('href');

                // Extract content
                let contentElement = await article.findElement(By.css('div.entry-summary > p'));
                result.content = await contentElement.getText();

                // Extract location or other meta info
                let locElement = await article.findElement(By.css('footer.entry-meta'));
                result.location = await locElement.getText();

                if (result.title && result.href && result.content && result.location) {
                    // Save job to MongoDB
                    let newJob = new Jobs({
                        job_title: result.title,
                        job_url: result.href,
                        company: result.location,
                        description: result.content
                    });

                    try {
                        await newJob.save();
                        jobCount++;
                    } catch (dbError) {
                        console.error('Error saving job to database:', dbError);
                    }
                }
            } catch (e) {
                console.error('Error extracting element:', e);
                // Continue with the next article if any element is missing
            }
        }

        result.success = true;
        result.message = 'Data successfully fetched and saved.';
        result.jobCount = jobCount;
        console.log(jobCount);
    } catch (error) {
        console.error('Error fetching data:', error);
        result.message = 'An error occurred while fetching data.';
    } finally {
        if (driver) {
            await driver.quit(); // Ensure the driver is closed even if an error occurs
        }
    }

    return result; // Return result object
}


module.exports = { byat_com, Job_ustad };















// Export the function
module.exports = {
    byat_com
};