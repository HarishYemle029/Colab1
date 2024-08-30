const { boolean } = require('joi');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    isResetVerified:{
        type: Boolean,
        default: false,
    },
    imageUrl: {
        type: String,
        default: function() {
            return `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(this.username || 'default')};`
        },
    },

});


const User = mongoose.model('User', UserSchema);

module.exports = User;
