const { updatePasswordSchema } = require('../validators/uservalidator');
const User = require('../models/userModel');
const Profile =require('../models/profile1');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const bcrypt = require("bcryptjs");

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
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>OTP Verification</title>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: Arial, sans-serif;
                        background-color: #f2f2f2;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        padding: 20px;
                        background-color: #6A5ACD; /* Soft lavender color */
                        border-top-left-radius: 8px;
                        border-top-right-radius: 8px;
                    }
                    .header img {
                        width: 150px;
                        height: auto;
                    }
                    .otp-container {
                        text-align: center;
                        padding: 20px;
                    }
                    .otp-container h2 {
                        color: #333;
                    }
                    .otp-code {
                        font-size: 32px;
                        color: #6A5ACD; /* Slightly darker shade of purple */
                        margin: 20px 0;
                    }
                    .otp-details {
                        font-size: 14px;
                        color: #999;
                    }
                    .footer {
                        text-align: center;
                        padding: 20px;
                        background-color: #DCDCDC; /* Light gray background */
                        border-bottom-left-radius: 8px;
                        border-bottom-right-radius: 8px;
                    }
                    .footer a {
                        text-decoration: none;
                        color: #6A5ACD;
                        margin: 0 10px;
                    }
                    .footer p {
                        color: #666;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <!-- Header Section -->
                    <div class="header">
                        <img src="https://res.cloudinary.com/dtyo4nbl2/image/upload/v1725026858/WhatsApp_Image_2024-08-29_at_03.59.21_4b049ea2_o5ff8z.jpg" alt="Company Logo">
                    </div>
            
                    <!-- OTP Section -->
                    <div class="otp-container">
                        <h2>Here Is Your One Time Password</h2>
                        <p class="otp-details">Valid for 10 minutes only!</p>
                        <div class="otp-code">${otp}</div>
                    </div>
            
                    <!-- Footer Section -->
                    <div class="footer">
                        <p>FAQs | Terms & Conditions | Contact Us</p>
                        <div>
                            <a href="#">LinkedIn</a>
                            <a href="#">Twitter</a>
                            <a href="#">Instagram</a>
                        </div>
                        <p>If you have any questions regarding your OTP, please visit our Privacy Policy.</p>
                    </div>
                </div>
            </body>
            </html>
            
            `,
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
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset OTP</title>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: Arial, sans-serif;
                        background-color: #f2f2f2;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        padding: 20px;
                        background-color: #6A5ACD; /* Soft lavender color */
                        border-top-left-radius: 8px;
                        border-top-right-radius: 8px;
                    }
                    .header h1 {
                        margin: 0;
                        color: #fff;
                        font-size: 24px;
                    }
                    .otp-container {
                        text-align: center;
                        padding: 20px;
                    }
                    .otp-container h2 {
                        color: #333;
                    }
                    .otp-code {
                        font-size: 32px;
                        color: #6A5ACD;
                        margin: 20px 0;
                        font-weight: bold;
                    }
                    .otp-details {
                        font-size: 14px;
                        color: #999;
                    }
                    .footer {
                        text-align: center;
                        padding: 20px;
                        background-color: #f2f2f2;
                        border-bottom-left-radius: 8px;
                        border-bottom-right-radius: 8px;
                    }
                    .footer p {
                        color: #666;
                        font-size: 12px;
                    }
                    .footer a {
                        text-decoration: none;
                        color: #6A5ACD;
                        margin: 0 10px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <!-- Header Section -->
                    <div class="header">
                        <h1>Password Reset OTP</h1>
                    </div>

                    <!-- OTP Section -->
                    <div class="otp-container">
                        <h2>Here Is Your One Time Password (OTP)</h2>
                        <p class="otp-details">Please use the OTP below to reset your password. The OTP is valid for 10 minutes.</p>
                        <div class="otp-code">${otp}</div>
                        <p class="otp-details">If you did not request a password reset, please ignore this email.</p>
                    </div>

                    <!-- Footer Section -->
                    <div class="footer">
                        <p>If you have any issues, please feel free to contact our support team at <a href="mailto:support@yourcompany.com">support@yourcompany.com</a></p>
                        <p>FAQs | Terms & Conditions | Privacy Policy</p>
                        <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
             `,
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

        // Mark the user as authorized for password reset
        user.isResetVerified = true;  // This flag should be updated
        user.otp = undefined;  // Clear the OTP
        user.otpExpires = undefined;  // Clear the OTP expiration
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
        const user = await User.findOne({ email, isResetVerified: true });  // Check if they are verified for reset

        if (!user) {
            return res.status(400).json({ success: false, message: "User not authorized for password reset" });
        }

        // Hash the new password and save
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.isResetVerified = false;  // Reset the flag after password reset
        await user.save();

        res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error resetting password: " + error.message });
    }
};



