const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    job_title: {
        type: String,
        required: true,
    },
    job_url: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Jobs = mongoose.model('jobs', JobSchema);

module.exports = Jobs;