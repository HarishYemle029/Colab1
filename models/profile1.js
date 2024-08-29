const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    location: { type: String },
    description: { type: String },
    profileImage: { type: String },
    expertise: [{ type: String }],
    projectsDone: { type: Number, default: 0 },
    joined: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Profile', profileSchema);
