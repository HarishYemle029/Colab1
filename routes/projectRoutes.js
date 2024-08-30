
const express = require('express');
const { sendOtp, verifyOtp, createAccount,login } = require('../controllers/authController');

const router = express.Router();

// Step 1: Enter Email and Send OTP
router.post('/send-otp', sendOtp);

// Step 2: Verify OTP
router.post('/verify-otp', verifyOtp);

// Step 3: Create Username and Password after OTP verification
router.post('/create-account', createAccount);

// Step 4: Login with Email and Password
router.post('/login', login);
module.exports = router;


const { updatePassword } = require('../controllers/authController');
const authenticateToken = require('../middleware/middleware'); 

// Update Password Route
router.post('/profile/update-password', authenticateToken, updatePassword);

const { deleteAccount } = require('../controllers/authController'); 


// Delete Account Route
router.delete('/profile/delete-account', authenticateToken, deleteAccount);
const { forgotPassword, verifyResetOtp, resetPassword } = require('../controllers/authController');

// Forgot password
router.post('/auth/forgot-password', forgotPassword);

// Verify OTP for password reset
router.post('/auth/verify-reset-otp', verifyResetOtp);

// Reset password after OTP verification
router.post('/auth/reset-password', resetPassword);

const { applyToProject } = require('../controllers/applicationController');
router.post('/apply', applyToProject);

const {
  updateUserProfile,
  addUserSkill,
  viewUserProfile,removeUserSkill
} = require('../controllers/profile2');

router.put('/updateProfile/:id', updateUserProfile);
router.put('/addSkillProfile/:id/skill', addUserSkill);
router.get('/profile/user/:id', viewUserProfile);
router.delete('/profile/:id/remove-skill', removeUserSkill);

const saveProject = require('../controllers/saveController');

// Save a project
router.post('/users/save-project', saveProject.saveProject);

// Get saved projects for a user
router.get('/users/:userId/saved-projects', saveProject.getSavedProjects);

// Remove a saved project
router.post('/users/remove-saved-project', saveProject.removeSavedProject);


const projectController = require('../controllers/projectController');


// Create a new project
router.post('/project/create', projectController.createProject);

// Get all projects
router.get('/projects/getallproject', projectController.getAllProjects);

// Get projects for a specific user
router.get('/projects/user/:userid', projectController.getProjectsByUser);
// delete project
router.delete('/projects/:projectid', projectController.deleteProject);
// get project details
router.get('/projects/:projectid', projectController.getProjectDetails);
// update project details
router.put('/projects/:projectid', projectController.updateProject);
const { deleteProjectsByUser } = require('../controllers/projectController');

// Route to delete all projects by userId
router.delete('/projects/user/:userid', deleteProjectsByUser);


module.exports = router;
