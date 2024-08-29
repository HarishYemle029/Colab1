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
    }
});


const User = mongoose.model('User', UserSchema);

module.exports = User;
