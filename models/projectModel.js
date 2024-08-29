const mongoose = require('mongoose');
const { applySchema } = require('./applicationModel');
const projectSchema = new mongoose.Schema({
    projectname: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    roles: {
        type: [String], // Array of strings to store roles
        required: true,
    },
    tags: {
        type: [String], // Array of strings to store tags
        required: true,
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId, // Reference to User Model
        ref: 'User',
        required: true,
    },
    hostid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applications: [applySchema],
    
    createdAt: {
        type: Date,
        default: Date.now, // Auto-generate the timestamp when the project is created
    },
});

module.exports = mongoose.model('Project', projectSchema);
