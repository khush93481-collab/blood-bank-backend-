const VolunteerAssignment = require('../models/volunteerAssignmentModel');
const User = require('../models/userModel');

// Assign a volunteer to a camp
exports.assignVolunteer = async (req, res, next) => {
  try {
    const { volunteerId, responsibility } = req.body;

    const volunteer = await User.findById(volunteerId);
    if (!volunteer || volunteer.role !== 'Volunteer') {
      return res.status(400).json({ success: false, message: 'Provided user is not a valid Volunteer' });
    }

    const assignment = await VolunteerAssignment.create({
      camp: req.params.id,
      volunteer: volunteerId,
      responsibility,
      assignedBy: req.user.id,
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'This volunteer is already assigned to this camp' });
    }
    next(error);
  }
};

// View all volunteers assigned to a camp
exports.getCampVolunteers = async (req, res, next) => {
  try {
    const assignments = await VolunteerAssignment.find({ camp: req.params.id })
      .populate('volunteer', 'name email phone')
      .populate('assignedBy', 'name email');
    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    next(error);
  }
};

// Update a volunteer's responsibility
exports.updateVolunteerAssignment = async (req, res, next) => {
  try {
    const assignment = await VolunteerAssignment.findByIdAndUpdate(
      req.params.assignmentId,
      { responsibility: req.body.responsibility },
      { new: true, runValidators: true }
    );
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

// Remove a volunteer from a camp
exports.removeVolunteerAssignment = async (req, res, next) => {
  try {
    const assignment = await VolunteerAssignment.findByIdAndDelete(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.status(200).json({ success: true, message: 'Volunteer removed from camp' });
  } catch (error) {
    next(error);
  }
};