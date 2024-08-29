const mongoose = require('mongoose');

const applySchema = new mongoose.Schema({
    userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    introductionMessage: { type: String, required: true },
    resumeUrl: { type: String },
    appliedAt: { type: Date, default: Date.now }
});

module.exports = {
    applySchema,
    Application: mongoose.model('Application', applySchema)
};
