const mongoose = require('mongoose');

const saveSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to the User model
        ref: 'User',
        required: true,
    },
    savedProjects: [{
        type: mongoose.Schema.Types.ObjectId,  // Reference to the Project model
        ref: 'Project',
        required: true,
    }],
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const SavedProject = mongoose.model('SavedProject', saveSchema);

module.exports = SavedProject;
