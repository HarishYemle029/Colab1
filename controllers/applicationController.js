const Project = require('../models/projectModel');
const User = require('../models/userModel');
const { uploadFileToCloudinary } = require('../configurations/cloudinaryUploader');
const { sendApplicationNotification } = require('../configurations/emailService');

exports.applyToProject = async (req, res) => {
    console.log('ayya')
    try {
        console.log(req.body)
        const { projectid, introductionMessage, userid } = req.body;
        // Fetch the project to check if it exists and populate host information
        const project = await Project.findById(projectid).populate('hostid');
        if (!project) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        // Check if the user has already applied to this project
        console.log(project)
        const alreadyApplied = project.applications.some(application => application.userid === userid);
        console.log(alreadyApplied)
        if (alreadyApplied) {
            return res.status(400).json({ error: 'You have already applied to this project.' });
        }

        // Fetch applicant information from the User model
        const user = await User.findById(userid);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        console.log("gvbeerhk")
        const applicantUsername = user.username;
        const applicantEmail = user.email;

        // Handle optional resume file upload
        let resumeUrl = null;
        if (req.files && req.files.resume) {
            const resumeFile = req.files.resume;
            const uploadResult = await uploadFileToCloudinary(resumeFile, process.env.FOLDER_NAME);
            resumeUrl = uploadResult.secure_url;
        }

        // Create the new application object
        const newApplication = {
            userid,
            introductionMessage,
            resumeUrl,
            appliedAt: new Date(), // Record the time of application
        };

        // Add the new application to the project's applications array
        project.applications.push(newApplication);
        await project.save(); // Save the project with the new application

        // Send email notification to the project host
        const hostEmail = project.hostid.email;
        await sendApplicationNotification(hostEmail, applicantUsername,applicantEmail, introductionMessage, resumeUrl);

        // Respond with a success message
        res.status(201).json({
            message: 'Application submitted successfully and the host has been notified.',
            project
        });
    } catch (error) {
        console.error('Error while applying to the project:', error);
        res.status(500).json({ error: 'Internal server error.'});
    }
};

