const express = require('express');
const scrapeController = require('../controllers/scrapeController');
// const scrapeController = require('../');
const CheckUserLogin = require('../middlewares/checklogin');
const router = express.Router();



router.post('/scrape', scrapeController.indeed);
router.post('/byat', scrapeController.byat_Jobs);
router.get('/jobs', scrapeController.all_jobs);
router.get('/job/:id', CheckUserLogin, scrapeController.save_Job);


module.exports = router;