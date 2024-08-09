const mongoose = require('mongoose');

const Save_JobSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
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

const Save_Jobs = mongoose.model('save_jobs', Save_JobSchema);

module.exports = Save_Jobs;