const Save_Jobs = require('../models/Save_Job');
const Jobs = require('../models/Jobs');

const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { byat_com } = require('../scraper/scraper');

exports.Job_ustad = async(req, res) => {
    try {
        let query = req.body.query;

        // Replace spaces with '+' if the query contains multiple words
        let q = query.trim().replace(/\s+/g, '+');
        const baseUrl = `https://pk.indeed.com/jobs?q=${q}`;

        // Set up WebDriver with Chrome in headless mode
        let options = new chrome.Options();
        // options.addArguments('headless'); // This is the correct way to set headless mode
        // options.addArguments('disable-gpu'); // Add other arguments as needed

        let driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        let results = [];

        for (let page = 0; page < 10; page++) {
            const url = `${baseUrl}&start=${page * 10}`;

            // Navigate to the URL
            await driver.get(url);

            // Extract data from the specified elements
            let articles = await driver.findElements(By.className('job_seen_beacon'));
            for (let article of articles) {
                let result = {};

                try {
                    let titleElement = await article.findElement(By.css('h2'));
                    result.title = await titleElement.getText();

                    let aTagElement = await titleElement.findElement(By.css('a'));
                    result.href = (await aTagElement.getAttribute('href'));

                    let locElement = await article.findElement(By.className('company_location css-17fky0v e37uo190'));
                    result.location = await locElement.getText();

                    let contentElement = await article.findElement(By.className('css-9446fg eu4oa1w0'));
                    result.content = await contentElement.getText();
                } catch (e) {
                    console.error('Error extracting element:', e);
                    continue; // Skip this result if any element is missing
                }

                // Check if all required fields are present and non-empty
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
            }
        }

        // Quit the driver
        await driver.quit();
        res.redirect(`/jobs?q=${query}`)

    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
};

exports.all_jobs = async(req, res) => {
    let query = req.query.q || '';
    try {
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const jobsPerPage = 25;
        const skip = (page - 1) * jobsPerPage;

        // Get the total number of jobs
        const total_jobs = await Jobs.countDocuments({});

        // Fetch jobs for the current page
        const jobs = await Jobs.find({})
            .skip(skip)
            .limit(jobsPerPage);

        // Calculate total pages
        const totalPages = Math.ceil(total_jobs / jobsPerPage);

        // Determine the range of pages to display
        const maxPagesToShow = 5;
        const halfMaxPages = Math.floor(maxPagesToShow / 2);
        let startPage = Math.max(1, page - halfMaxPages);
        let endPage = Math.min(totalPages, page + halfMaxPages);

        if (endPage - startPage + 1 < maxPagesToShow) {
            if (startPage === 1) {
                endPage = Math.min(maxPagesToShow, totalPages);
            } else if (endPage === totalPages) {
                startPage = Math.max(1, totalPages - maxPagesToShow + 1);
            }
        }

        res.render('index', {
            query,
            jobs,
            total_jobs,
            totalPages,
            currentPage: page,
            startPage,
            endPage,
            title: 'Jobs',
            mainView: 'job_listing'
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Error fetching jobs' });
    }

};

exports.byat_Jobs = async(req, res) => {
    console.log(req.body.q);
    await byat_com(req.body.q);
    res.redirect('/jobs');
};















exports.save_Job = async(req, res) => {
    try {
        const jobId = req.params.id;

        // Find the job by ID
        const job = await Jobs.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // Ensure user is authenticated
        const user = req.session.user;
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Save the job to the Save_Jobs collection
        const save_job = new Save_Jobs({
            user: user._id,
            job_title: job.job_title,
            job_url: job.job_url,
            company: job.company,
            description: job.description
        });

        await save_job.save(); // Save the job

        res.status(200).json({ message: 'Job saved successfully' });
    } catch (error) {
        console.error('Error saving job:', error);
        res.status(500).json({ error: 'Error saving job' });
    }
};