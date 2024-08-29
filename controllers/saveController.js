const SavedProject = require('../models/saveModel');
const Project = require('../models/projectModel');
const User = require('../models/userModel');

// Save a project to user's saved projects list
exports.saveProject = async (req, res) => {
  try {
    const { userid, projectid } = req.body;
    // const userid = req.user.id;
    // Check if the project exists
    const project = await Project.findById(projectid);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Check if the user exists
    const user = await User.findById(userid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check if the saved project record exists for the user
    let savedProjectRecord = await SavedProject.findOne({ user: userid });

    if (!savedProjectRecord) {
      // Create a new record if the user hasn't saved any projects yet
      savedProjectRecord = new SavedProject({
        user: userid,
        savedProjects: [projectid],
      });
    } else {
      // If the project isn't already saved, add it to the list
      if (!savedProjectRecord.savedProjects.includes(projectid)) {
        savedProjectRecord.savedProjects.push(projectid);
      } else {
        return res.status(400).json({ message: 'Project already saved' });
      }
    }

    await savedProjectRecord.save();
    res.status(200).json({ message: 'Project saved successfully' });

  } catch (error) {
    res.status(500).json({ error: 'Failed to save project', details: error.message });
  }
};

// Fetch user's saved projects
exports.getSavedProjects = async (req, res) => {
  try {
    const { userid } = req.params;

    // Fetch the saved projects list for the user and populate the project details
    const savedProjectRecord = await SavedProject.findOne({ user: userid }).populate('savedProjects');
    if (!savedProjectRecord) return res.status(404).json({ error: 'No saved projects found for the user' });

    res.status(200).json(savedProjectRecord.savedProjects);

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved projects', details: error.message });
  }
};

// Remove a saved project from user's saved projects list
exports.removeSavedProject = async (req, res) => {
  try {
    const { userid, projectid } = req.body;

    const savedProjectRecord = await SavedProject.findOne({ user: userid });
    if (!savedProjectRecord) return res.status(404).json({ error: 'User has no saved projects' });

    // Remove the project from the user's saved projects list
    savedProjectRecord.savedProjects = savedProjectRecord.savedProjects.filter(
      (savedProjectid) => savedProjectid.toString() !== projectid
    );

    await savedProjectRecord.save();

    res.status(200).json({ message: 'Project removed from saved list' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove saved project', details: error.message });
  }
};
