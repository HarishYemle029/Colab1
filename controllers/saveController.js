const SavedProject = require('../models/saveModel');
const Project = require('../models/projectModel');
const User = require('../models/userModel');

// Save a project to user's saved projects list
// Save a project
exports.saveProject = async (req, res) => { // Ensure the function is declared as async
  try {
    const { userid, projectid } = req.body;
    console.log(userid)
    console.log(projectid)
    // Validate request body
    if (!userid || !projectid) {
      return res.status(400).json({ error: 'User ID and Project ID are required' });
    }

    // Check if the project exists
    const project = await Project.findById(projectid); 
   // await inside async function
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Check if the user exists
    const user = await User.findById(userid); 
    if (!user) return res.status(404).json({ error: 'User not found' });
    console.log("jbvegerhb")// await inside async function
    // Find or create the saved project record for the user
    let savedProjectRecord = await SavedProject.findOne({ user: userid }); // await inside async function

    if (!savedProjectRecord) {
      // Create a new record if the user hasn't saved any projects yet
      savedProjectRecord = new SavedProject({
        user: userid,
        savedProjects: [projectid],
      });
      await savedProjectRecord.save(); // await inside async function
    } else {
      // Check if the project is already saved
      console.log(savedProjectRecord.savedProjects.includes(projectid))
      if (savedProjectRecord.savedProjects.includes(projectid)) {
        return res.status(400).json({ message: 'Project already saved' });
      }

      // Add the project to the saved projects list
      savedProjectRecord.savedProjects.push(projectid);
      await savedProjectRecord.save(); // await inside async function
    }

    return res.status(200).json({ message: 'Project saved successfully' });
  } catch (error) {
    console.error('Error saving project:', error);
    return res.status(500).json({ error: 'An error occurred while saving the project' });
  }
};

// Fetch user's saved projects
exports.getSavedProjects = async (req, res) => {
  console.log("jfbehgvb")
  try {
    const { userId } = req.params;
    console.log(userId)
    // Fetch the saved projects list for the user and populate the project details
    const savedProjectRecord = await SavedProject.findOne({ user: userId }).populate('savedProjects');
    console.log(savedProjectRecord)
    if (!savedProjectRecord) {
      console
      return res.status(200).json([]);
  }

    res.status(200).json(savedProjectRecord.savedProjects);

  } catch (error) {
    console.error("Failed to fetch saved projects:", error);
    res.status(500).json({ error: 'Failed to fetch saved projects', details: error.message });
  }
};

// Remove a saved project from user's saved projects list
exports.removeSavedProject = async (req, res) => {
  try {
    const { userid, projectid } = req.body;
    console.log(userid);
    console.log(projectid);

    // Validate request body
    if (!userid || !projectid) {
      return res.status(400).json({ error: 'User ID and Project ID are required' });
    }

    // Check if the project exists
    const project = await Project.findById(projectid);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Check if the user exists
    const user = await User.findById(userid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Find the saved project record for the user
    const savedProjectRecord = await SavedProject.findOne({ user: userid });
    if (!savedProjectRecord) {
      return res.status(404).json({ message: 'No saved projects found for this user' });
    }

    // Check if the project is saved
    if (!savedProjectRecord.savedProjects.includes(projectid)) {
      return res.status(400).json({ message: 'Project not found in saved projects' });
    }

    // Remove the project from the saved projects list
    savedProjectRecord.savedProjects = savedProjectRecord.savedProjects.filter(id => id.toString() !== projectid.toString());
    await savedProjectRecord.save();

    return res.status(200).json({ message: 'Project unsaved successfully' });
  } catch (error) {
    console.error('Error unsaving project:', error);
    return res.status(500).json({ error: 'An error occurred while unsaving the project' });
  }
};
