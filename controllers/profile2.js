const Profile = require('../models/profile1');
const User = require('../models/userModel');
const { uploadFileToCloudinary } = require('../configurations/cloudinaryUploader');

// Update User Profile
// Update User Profile
exports.updateUserProfile = async (req, res) => {
    try {
        const userid = req.params.id;
        const { username, location, description, expertise } = req.body;
        let profileImageUrl;

        // Check if a profile image is provided and upload it to Cloudinary
        if (req.files && req.files.profileImage) {
            const file = req.files.profileImage;
            const uploadResult = await uploadFileToCloudinary(file, process.env.FOLDER_NAME);
            profileImageUrl = uploadResult.secure_url;
        }

        // Fetch user to update their information
        const user = await User.findById(userid);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Update the username if provided
        if (username) {
            user.username = username;
            await user.save(); // Save the updated user data

            // If the user changes their username and no profile image is set, generate a new default image
            if (!profileImageUrl) {
                profileImageUrl = `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(username)}`;
            }
        }

        // Update or create the profile
        const updatedProfile = await Profile.findOneAndUpdate(
            { userid: user._id },
            {
                username: user.username,  // Ensure the updated username is reflected in the profile
                location,
                description,
                expertise,
                ...(profileImageUrl && { profileImage: profileImageUrl }),
            },
            { new: true, upsert: true }
        );

        res.json(updatedProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Add User Skill
exports.addUserSkill = async (req, res) => {
    try {
        const userid = req.params.id;
        const { skill } = req.body;

        // Update profile by adding a new skill to the expertise array
        const updatedProfile = await Profile.findOneAndUpdate(
            { userid },
            { $push: { expertise: skill } },
            { new: true }
        );

        res.json(updatedProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.viewUserProfile = async (req, res) => {
  try {
      const userid = req.params.id;

      // Fetch the user's profile using the userId
      const userProfile = await Profile.findOne({ userid: userid }).populate("userid", "username");

      if (!userProfile) {
          return res.status(404).json({ error: "Profile not found" });
      }

      // Return the profile details
      return res.status(200).json({
          success: true,
          profile: userProfile,
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: error.message,
      });
  }
};
exports.removeUserSkill = async (req, res) => {
    try {
        const userid = req.params.id;
        const { skill } = req.body;

        if (!skill) {
            return res.status(400).json({
                success: false,
                message: "Skill to remove is required.",
            });
        }

        // Find the user profile and remove the skill from the expertise array
        const updatedProfile = await Profile.findOneAndUpdate(
            { userid },
            { $pull: { expertise: skill } }, // Removes the skill from the array
            { new: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Skill removed successfully',
            profile: updatedProfile,
        });
    } catch (error) {
        console.error("Error removing skill:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
        });
    }
};
