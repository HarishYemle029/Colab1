const { updatePasswordSchema } = require('../validators/uservalidator');
const User = require('../models/userModel');
const Profile =require('../models/profile1');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const bcrypt = require("bcryptjs")

// Step 1: Enter Email and Send OTP
exports.sendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user && user.isVerified) {
            return res.status(400).json({ success: false, message: 'Email is already verified. Please log in.' });
        }

        if (!user) {
            user = new User({ email });
        }

        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
        });

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Step 2: Verify OTP
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid OTP or OTP expired' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


// Step 3: Create Username and Password after OTP verification
exports.createAccount = async (req, res) => {
    const { email, username, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !user.isVerified) {
            return res.status(400).json({ success: false, message: 'Email not verified or invalid' });
        }

        if (user.username) {
            return res.status(400).json({ success: false, message: 'Account already exists. Please log in.' });
        }

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.username = username;
        const defaultProfileImage = `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(username)}`;
        user.profileImage = defaultProfileImage;
        await user.save();
        const profile = new Profile({
            userid: user._id,
            username: user.username,
            location: null,
            description: null,
            expertise: [],
            profileImage: defaultProfileImage,
        });
        await profile.save();
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                imageUrl: user.imageUrl,  // Add avatar URL to the response
            },
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Step 4: Login with Email and Password
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found. Please register first.' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ success: false, message: 'Please verify your email before logging in.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
            token,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};
exports.updatePassword = async (req, res) => {
    try {
        // Validate the request body
        const { error } = updatePasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { currentPassword, newPassword } = req.body; 

        // Find the user by ID from the token (assuming `req.user` contains the user's ID)
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Check if the current password matches
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Current password is incorrect." });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Save the updated user
        await user.save();

        res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Error while updating password:", error);
        return res.status(500).json({ error: "Internal server error. Please try again later." });
    }
};

//hander for delete account
exports.deleteAccount = async (req, res) => {
    try {
        const { password } = req.body; // Extract password from request

        // Find the user by ID from the token (assuming `req.user` contains the user's ID)
        const user = await User.findById(req.user.id);

        // Check if user exists
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Check if the provided password matches the hashed password in the database
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: "Incorrect password." });
        }

        // Delete the user if the password is correct
        await user.deleteOne();

        res.status(200).json({ message: "Account deleted successfully." });
    } catch (error) {
        console.error("Error while deleting account:", error);
        return res.status(500).json({ error: "Internal server error. Please try again later." });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Generate OTP and save to user
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
        await user.save();

        // Send OTP email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
        });

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is ${otp}. It will expire in 10 minutes.`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error sending OTP: " + error.message });
    }
};
exports.verifyResetOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Find user with matching email and valid OTP
        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() } // Check if OTP is still valid
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        // Mark the user as verified for password reset
        user.isResetVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "OTP verified. You can now reset your password." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error verifying OTP: " + error.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        // Find the user and ensure they are allowed to reset their password
        const user = await User.findOne({ email, isResetVerified: true });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not authorized for password reset" });
        }

        // Hash the new password and save
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.isResetVerified = false; // Reset flag
        await user.save();

        res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error resetting password: " + error.message });
    }
};
