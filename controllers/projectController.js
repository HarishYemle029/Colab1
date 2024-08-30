const Project = require("../models/projectModel");

// Create a new project with UserId provided in the request body
exports.createProject = async (req, res) => {
    try {
      console.log("Request Body:", req.body);
      const { projectname, description, roles, tags, userid } = req.body;
  
      // Check if all required fields are provided
      if (!projectname || !description || !roles || !tags || !userid) {
        return res.status(400).json({
          error: "All fields (projectname, description, roles, tags, userid) are required.",
        });
      }
  
      // Create new project instance
      const newProject = new Project({
        projectname,
        description,
        roles: Array.isArray(roles) ? roles : roles.split(','),
        tags: Array.isArray(tags) ? tags : tags.split(','),
        userid,
        hostid: userid,
      });
  
      // Save the new project to the database
      const savedProject = await newProject.save();
      console.log("Saved Project:", savedProject);
      res.status(201).json({
        project: savedProject,
      });
    } catch (error) {
      console.error("Error while creating project:", error);
      return res.status(500).json({
        error: "Internal server error. Please try again later.",
      });
    }
  };

// Get all projects of a specific user by UserId provided in the request body
exports.getProjectsByUser = async (req, res) => {
    try {
        const { userid } = req.params;  // Extract userid from URL parameters

        if (!userid) {
            console.error("userid is missing in the request.");
            return res.status(400).json({
                success: false,
                error: "userid is required.",
            });
        }

        // Fetch projects by userid and populate user information
        const projects = await Project.find({ userid }).populate('userid', 'username imageUrl');

        if (projects.length === 0) {
            return []
        }

        res.status(200).json({
            success: true,
            projects,
        });
    } catch (error) {
        console.error("Error while retrieving projects:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error. Please try again later.",
        });
    }
};

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('userid', 'username imageUrl');
    res.status(200).json({ projects });
  } catch (error) {
    console.error("Failed to fetch projects:", error); // Look at what error is being logged here
    return res.status(500).json({ error: "Failed to fetch projects." });
  }
};

// Get project details by projectId
exports.getProjectDetails = async (req, res) => {
    try {
        const { projectid } = req.params;

        if (!projectid) {
            return res.status(400).json({
                error: "ProjectId is required.",
            });
        }

        // Find project by ID and populate user information
        const project = await Project.findById(projectid).populate('userid', 'username imageUrl');

        if (!project) {
            return res.status(404).json({
                error: "Project not found.",
            });
        }

        res.status(200).json({
            project,
        });
    } catch (error) {
        console.error("Failed to get project details:", error);
        return res.status(500).json({
            error: "Failed to get project details.",
        });
    }
};

// Delete a project by projectId
exports.deleteProject = async (req, res) => {
    try {
        const { projectid } = req.params;

        if (!projectid) {
            return res.status(400).json({
                error: "ProjectId is required.",
            });
        }

        const deletedProject = await Project.findByIdAndDelete(projectid);

        if (!deletedProject) {
            return res.status(404).json({
                error: "Project not found.",
            });
        }

        res.status(200).json({
            message: "Project successfully deleted.",
            project: deletedProject,
        });
    } catch (error) {
        console.error("Failed to delete project:", error);
        return res.status(500).json({
            error: "Failed to delete project.",
        });
    }
};

// Update a project by projectId
exports.updateProject = async (req, res) => {
    try {
        const { projectid } = req.params;
        const { projectname, description, roles, tags } = req.body;

        if (!projectid) {
            return res.status(400).json({
                error: "ProjectId is required.",
            });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            projectid,
            {
                projectname,
                description,
                roles: Array.isArray(roles) ? roles : roles.split(','),
                tags: Array.isArray(tags) ? tags : tags.split(','),
            },
            { new: true } // Return the updated project
        );

        if (!updatedProject) {
            return res.status(404).json({
                error: "Project not found.",
            });
        }

        res.status(200).json({
            project: updatedProject,
        });
    } catch (error) {
        console.error("Failed to update project:", error);
        return res.status(500).json({
            error: "Failed to update project.",
       });
 }
};
exports.deleteProjectsByUser = async (req, res) => {
    try {
        const { userid } = req.params;

        // Check if the userid is provided
        if (!userid) {
            return res.status(400).json({
                error: "UserId is required.",
            });
        }

        // Delete all projects associated with the userid
        const deletedProjects = await Project.deleteMany({ userid });

        // Check if any projects were deleted
        if (deletedProjects.deletedCount === 0) {
            return res.status(404).json({
                message: "No projects found for this user.",
            });
        }

        // Return a success message along with the number of deleted projects
        res.status(200).json({
            message: `${deletedProjects.deletedCount} project(s) deleted successfully.`,
        });
    } catch (error) {
        console.error("Failed to delete projects by user:", error);
        return res.status(500).json({
            error: "Failed to delete projects. Please try again later.",
        });
    }
};
