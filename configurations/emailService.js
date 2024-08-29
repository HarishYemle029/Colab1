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
                <p>Hello,</p>
                <p>${applicantUsername} (${applicantEmail}) has applied to your project.</p>
                <p><strong>Introduction Message:</strong></p>
                <p>${introductionMessage}</p>
                ${resumeUrl ? `<p><strong>Resume:</strong> <a href="${resumeUrl}">Download</a></p>` : ''}
                <p>Best regards,<br>Your Project Platform Team</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
