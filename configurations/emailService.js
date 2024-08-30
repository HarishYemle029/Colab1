const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

exports.sendApplicationNotification = async (hostEmail, applicantUsername, applicantEmail, introductionMessage, resumeUrl) => {
    try {
        let mailOptions = {
            from: process.env.MAIL_USER,
            to: hostEmail,
            subject: `New Application from ${applicantUsername}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background-color: #007bff; padding: 15px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                <h2 style="color: #ffffff; margin: 0; text-align: center;">New Application Received</h2>
            </div>
            
            <!-- Content -->
            <div style="padding: 20px;">
                <p style="font-size: 16px; color: #333;">Hello,</p>
                <p style="font-size: 16px; color: #333;">
                    You have received a new application from 
                    <strong>${applicantUsername}</strong> 
                    (<a href="mailto:${applicantEmail}" style="color: #007bff; text-decoration: none;">${applicantEmail}</a>).
                </p>
                <p style="font-size: 16px; color: #333;"><strong>Introduction Message:</strong></p>
                
                <!-- Introduction Message -->
                <div style="background-color: #eef2f7; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; color: #555;">
                    <p style="margin: 0;">${introductionMessage}</p>
                </div>
                
                <!-- Resume (if provided) -->
            
                <p style="font-size: 16px; color: #333;">
                    <strong>Resume:</strong> 
                    <a href="${resumeUrl}" style="color: #007bff; text-decoration: none;">Download</a>
                </p>

                <!-- Closing Message -->
                <p style="font-size: 16px; color: #333;">
                    Best regards,<br>
                    Your Project Platform Team
                </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f7f7f7; padding: 15px; text-align: center; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                <p style="font-size: 12px; color: #999;">
                    If you have any questions, feel free to contact us at 
                    <a href="mailto:support@projectplatform.com" style="color: #007bff; text-decoration: none;">
                        collabfinder06@gmail.com
                    </a>
                </p>
            </div>
        </div>
    `
};

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

